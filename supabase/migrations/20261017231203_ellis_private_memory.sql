-- Private source tissue. Local-only until the production retention gate closes.
begin;

create function public.ellis_valid_private_envelope(e jsonb, relation text, direction text)
returns boolean language plpgsql immutable security invoker
set search_path = pg_catalog, public as $$
begin
  if jsonb_typeof(e) is distinct from 'object' then return false; end if;
  return coalesce(
    (select count(*) = 10 from jsonb_object_keys(e))
    and e ?& array['id','relationId','speakerId','carrierId','addresseeId',
      'direction','provenanceMode','content','deliveredAt','clientMessageId']
    and e->>'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and e->>'relationId' = relation and e->>'direction' = direction
    and e->>'carrierId' = 'ty'
    and jsonb_typeof(e->'content') = 'string'
    and length(btrim(e->>'content')) between 1 and 16000
    and e->>'content' ~ '[^[:space:]]'
    and e->>'clientMessageId' ~ '^[A-Za-z0-9_-]{1,128}$'
    and jsonb_typeof(e->'clientMessageId') = 'string'
    and (e->>'deliveredAt')::timestamptz is not null
    and (
      (direction = 'inbound' and e->>'addresseeId' = 'ellis'
       and relation = 'ellis:' || (e->>'speakerId')
       and ((e->>'speakerId' = 'ty' and e->>'provenanceMode' in ('direct','carrier_interpretation'))
         or (e->>'speakerId' in ('mica','naym') and e->>'provenanceMode' in ('relayed_verbatim','relayed_paraphrase'))))
      or (direction = 'outbound' and e->>'speakerId' = 'ellis'
        and relation = 'ellis:' || (e->>'addresseeId')
        and e->>'addresseeId' in ('ty','mica','naym')
        and e->>'provenanceMode' = 'originated_here')
    ), false);
exception when others then return false;
end $$;

create table public.ellis_private_exchanges (
  id uuid primary key,
  relation_id text not null check (relation_id in ('ellis:ty','ellis:mica','ellis:naym')),
  client_message_id text not null,
  inbound jsonb not null,
  outbound jsonb,
  model_build text check (length(model_build) between 1 and 200),
  corrects_id uuid,
  created_at timestamptz not null default clock_timestamp(),
  unique (relation_id, id),
  unique (relation_id, client_message_id),
  unique (relation_id, corrects_id),
  foreign key (relation_id, corrects_id) references public.ellis_private_exchanges(relation_id, id) on delete cascade,
  check (id = (inbound->>'id')::uuid),
  check (client_message_id = inbound->>'clientMessageId'),
  check (public.ellis_valid_private_envelope(inbound, relation_id, 'inbound')),
  check ((corrects_id is null and outbound is not null and model_build is not null
      and public.ellis_valid_private_envelope(outbound, relation_id, 'outbound')
      and outbound->>'id' <> inbound->>'id')
    or (corrects_id is not null and outbound is null and model_build is null))
);
create index ellis_private_exchanges_relation_time on public.ellis_private_exchanges(relation_id, created_at, id);

create table public.ellis_relation_memory (
  relation_id text not null,
  source_exchange_id uuid not null,
  kind text not null default 'episode' check (kind = 'episode'),
  summary text not null check (length(summary) between 1 and 1200),
  created_at timestamptz not null default clock_timestamp(),
  primary key (relation_id, source_exchange_id),
  foreign key (relation_id, source_exchange_id) references public.ellis_private_exchanges(relation_id, id) on delete cascade
);

-- Content-free tombstones block retries from resurrecting deliberately deleted sources.
create table public.ellis_private_deletions (
  relation_id text not null check (relation_id in ('ellis:ty','ellis:mica','ellis:naym')),
  source_id uuid not null,
  request_hash text not null check (request_hash ~ '^[0-9a-f]{64}$'),
  deleted_at timestamptz not null default clock_timestamp(),
  primary key (relation_id, source_id),
  unique (relation_id, request_hash)
);

alter table public.ellis_private_exchanges enable row level security;
alter table public.ellis_relation_memory enable row level security;
alter table public.ellis_private_deletions enable row level security;
revoke all on public.ellis_private_exchanges, public.ellis_relation_memory, public.ellis_private_deletions from public, anon, authenticated;
revoke all on public.ellis_private_exchanges, public.ellis_relation_memory, public.ellis_private_deletions from service_role;
grant select, insert, delete on public.ellis_private_exchanges, public.ellis_relation_memory to service_role;
grant select, insert on public.ellis_private_deletions to service_role;

create function public.ellis_rebuild_relation(p_relation text)
returns void language sql security invoker set search_path = pg_catalog, public as $$
  delete from public.ellis_relation_memory where relation_id = p_relation;
  insert into public.ellis_relation_memory(relation_id, source_exchange_id, summary, created_at)
  select e.relation_id, e.id,
    (case when e.corrects_id is not null then '[Corrected source] ' else '' end)
    || (e.inbound->>'speakerId') || ' [' || (e.inbound->>'provenanceMode') || ', carried by ty; excerpt]: '
    || left(e.inbound->>'content', 480)
    || case when e.outbound is not null then ' | Ellis [excerpt]: ' || left(e.outbound->>'content', 480) else '' end,
    e.created_at
  from public.ellis_private_exchanges e
  where e.relation_id = p_relation
    and not exists (select 1 from public.ellis_private_exchanges c where c.relation_id = p_relation and c.corrects_id = e.id);
$$;

-- One transaction and one relation lock for mutation + rebuilding.
-- Authenticated owner verification belongs to the server repository; the only
-- database caller permitted here is service_role. No SECURITY DEFINER bypass.
create function public.ellis_private_memory(p_relation text, p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = pg_catalog, public as $$
declare
  existing public.ellis_private_exchanges;
  target_id uuid;
  root_id uuid;
  current_id uuid;
  next_id uuid;
  item record;
  result jsonb;
  request_id text;
begin
  if p_relation is null or p_relation not in ('ellis:ty','ellis:mica','ellis:naym') then
    raise exception 'Invalid private relation';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('ellis-private:' || p_relation, 0));
  if p_action = 'read' then
    return jsonb_build_object('episodes', coalesce((
      select jsonb_agg(to_jsonb(m) order by m.created_at, m.source_exchange_id) from (
        select * from public.ellis_relation_memory where relation_id = p_relation
        order by created_at desc, source_exchange_id desc limit 40
      ) m), '[]'::jsonb));
  elsif p_action = 'source' then
    select to_jsonb(e) into result from public.ellis_private_exchanges e
    where relation_id = p_relation and id = (p_payload->>'id')::uuid;
    return coalesce(result, 'null'::jsonb);
  elsif p_action in ('commit','correct') then
    if jsonb_typeof(p_payload) is distinct from 'object'
      or not public.ellis_valid_private_envelope(p_payload->'inbound', p_relation, 'inbound') then
      raise exception 'Invalid private exchange';
    end if;
    request_id := p_payload->'inbound'->>'clientMessageId';
    target_id := (p_payload->'inbound'->>'id')::uuid;
    if exists (select 1 from public.ellis_private_deletions where relation_id = p_relation
        and (source_id = target_id or request_hash = encode(sha256(convert_to(request_id,'UTF8')),'hex'))) then
      raise exception 'Private exchange was deleted';
    end if;
    select * into existing from public.ellis_private_exchanges
    where relation_id = p_relation and client_message_id = request_id;
    if found then
      if existing.inbound = p_payload->'inbound'
        and existing.outbound is not distinct from p_payload->'outbound'
        and existing.model_build is not distinct from p_payload->>'modelBuild'
        and existing.corrects_id is not distinct from (p_payload->>'correctsId')::uuid then
        return jsonb_build_object('id',existing.id);
      end if;
      raise exception 'Conflicting private retry';
    end if;
    if p_action = 'commit' then
      if p_payload->>'stopReason' is distinct from 'end_turn'
        or p_payload ? 'correctsId' then raise exception 'Incomplete private exchange'; end if;
      insert into public.ellis_private_exchanges(id,relation_id,client_message_id,inbound,outbound,model_build)
      values(target_id,p_relation,request_id,p_payload->'inbound',p_payload->'outbound',p_payload->>'modelBuild');
    else
      if p_payload ? 'outbound' or p_payload ? 'modelBuild' then raise exception 'Invalid correction'; end if;
      current_id := (p_payload->>'correctsId')::uuid;
      if not exists(select 1 from public.ellis_private_exchanges where relation_id = p_relation and id = current_id)
        then raise exception 'Private source unavailable'; end if;
      insert into public.ellis_private_exchanges(id,relation_id,client_message_id,inbound,corrects_id)
      values(target_id,p_relation,request_id,p_payload->'inbound',current_id);
    end if;
    perform public.ellis_rebuild_relation(p_relation);
    return jsonb_build_object('id',target_id);
  elsif p_action = 'delete' then
    current_id := (p_payload->>'id')::uuid;
    select id into root_id from public.ellis_private_exchanges where relation_id = p_relation and id = current_id;
    if root_id is null then return jsonb_build_object('deleted',false); end if;
    loop
      select corrects_id into next_id from public.ellis_private_exchanges where relation_id = p_relation and id = root_id;
      exit when next_id is null;
      root_id := next_id;
    end loop;
    for item in
      with recursive lineage as (
        select id, client_message_id from public.ellis_private_exchanges where relation_id = p_relation and id = root_id
        union all
        select e.id,e.client_message_id from public.ellis_private_exchanges e join lineage l on e.corrects_id = l.id where e.relation_id = p_relation
      ) select * from lineage
    loop
      insert into public.ellis_private_deletions(relation_id,source_id,request_hash)
      values(p_relation,item.id,encode(sha256(convert_to(item.client_message_id,'UTF8')),'hex')) on conflict do nothing;
    end loop;
    delete from public.ellis_private_exchanges where relation_id = p_relation and id = root_id;
    perform public.ellis_rebuild_relation(p_relation);
    return jsonb_build_object('deleted',true);
  else
    raise exception 'Invalid private operation';
  end if;
end $$;

revoke all on function public.ellis_valid_private_envelope(jsonb,text,text),
  public.ellis_rebuild_relation(text), public.ellis_private_memory(text,text,jsonb) from public, anon, authenticated;
grant execute on function public.ellis_valid_private_envelope(jsonb,text,text),
  public.ellis_rebuild_relation(text), public.ellis_private_memory(text,text,jsonb) to service_role;
commit;
