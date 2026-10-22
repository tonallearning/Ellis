-- Preserve the owner beats that survived the public hall's rolling window.
-- Their summaries are excerpts, never reconstructed verbatim exchanges.
begin;

create table public.ellis_owner_history (
  id uuid primary key,
  occurred_at timestamptz not null,
  fidelity text not null check (fidelity in ('legacy_excerpt', 'exact_public_turn')),
  summary text not null check (length(summary) between 1 and 1200),
  exact_inbound text,
  exact_outbound text,
  check (
    (fidelity = 'legacy_excerpt' and exact_inbound is null and exact_outbound is null)
    or
    (fidelity = 'exact_public_turn'
      and length(btrim(exact_inbound)) between 1 and 16000
      and length(btrim(exact_outbound)) between 1 and 16000)
  )
);
create index ellis_owner_history_time on public.ellis_owner_history(occurred_at, id);

alter table public.ellis_owner_history enable row level security;
revoke all on public.ellis_owner_history from public, anon, authenticated;
grant select, insert, delete on public.ellis_owner_history to service_role;

insert into public.ellis_owner_history(id, occurred_at, fidelity, summary)
select (beat->>'beatId')::uuid,
       (beat->>'occurredAt')::timestamptz,
       'legacy_excerpt',
       beat->>'summary'
from public.ellis_visitor_memory owner_row
cross join lateral jsonb_array_elements(owner_row.episodic_beats) beat
where owner_row.ip_hash = 'owner'
  and beat->>'beatId' is not null
  and beat->>'occurredAt' is not null
  and length(beat->>'summary') between 1 and 1200
on conflict (id) do nothing;

create function public.ellis_owner_history_read(p_limit integer default 500)
returns jsonb language plpgsql stable security invoker
set search_path = pg_catalog, public as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 500 then
    raise exception 'Invalid owner history limit';
  end if;
  return jsonb_build_object('sources', coalesce((
    select jsonb_agg(to_jsonb(s) order by s.occurred_at, s.id)
    from (
      select h.*
      from public.ellis_owner_history h
      order by h.occurred_at desc, h.id desc
      limit p_limit
    ) s
  ), '[]'::jsonb));
end $$;

revoke all on function public.ellis_owner_history_read(integer)
  from public, anon, authenticated;
grant execute on function public.ellis_owner_history_read(integer)
  to service_role;

commit;
