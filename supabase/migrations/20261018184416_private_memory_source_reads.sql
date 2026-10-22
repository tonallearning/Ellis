-- Lossless, relation-scoped private source retrieval for authenticated server assembly.
begin;

create function public.ellis_private_sources(p_relation text, p_limit integer default 40)
returns jsonb language plpgsql stable security invoker
set search_path = pg_catalog, public as $$
begin
  if p_relation is null or p_relation not in ('ellis:ty','ellis:mica','ellis:naym') then
    raise exception 'Invalid private relation';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 40 then
    raise exception 'Invalid private source limit';
  end if;

  return jsonb_build_object('sources', coalesce((
    select jsonb_agg(to_jsonb(s) order by s.created_at, s.id)
    from (
      select e.*
      from public.ellis_private_exchanges e
      where e.relation_id = p_relation
        and not exists (
          select 1
          from public.ellis_private_exchanges c
          where c.relation_id = p_relation and c.corrects_id = e.id
        )
      order by e.created_at desc, e.id desc
      limit p_limit
    ) s
  ), '[]'::jsonb));
end $$;

revoke all on function public.ellis_private_sources(text,integer)
  from public, anon, authenticated;
grant execute on function public.ellis_private_sources(text,integer)
  to service_role;

commit;
