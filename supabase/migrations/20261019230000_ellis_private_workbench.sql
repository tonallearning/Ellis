-- A scheduled opening is not a visitor turn or a relation-memory source.
-- One UTC slot is one opportunity; retries cannot create another attempt.
create table public.ellis_private_workbench (
  slot_at timestamptz primary key,
  state text not null default 'opening'
    check (state in ('opening', 'passed', 'attempted', 'unavailable')),
  outcome text null check (outcome in ('worked', 'failed', 'unfinished')),
  retained_trace text null check (length(retained_trace) between 1 and 4000),
  source text not null default 'ellis_scheduled_choice'
    check (source = 'ellis_scheduled_choice'),
  model_build text not null,
  opened_at timestamptz not null default now(),
  completed_at timestamptz null,
  check (
    (state = 'attempted' and outcome is not null and completed_at is not null)
    or (state = 'passed' and outcome is null and retained_trace is null and completed_at is not null)
    or (state = 'unavailable' and outcome is null and retained_trace is null and completed_at is not null)
    or (state = 'opening' and outcome is null and retained_trace is null and completed_at is null)
  )
);

comment on table public.ellis_private_workbench is
  'Ellis-private scheduled choices. Raw attempts are discarded unless Ellis explicitly retains a trace; no relation or public publication path.';
comment on column public.ellis_private_workbench.outcome is
  'Ellis self-assessment, not an externally verified result. A failed outcome remains failed.';

create index ellis_private_workbench_recent_idx
  on public.ellis_private_workbench (slot_at desc)
  where state in ('passed', 'attempted');

alter table public.ellis_private_workbench enable row level security;
revoke all on public.ellis_private_workbench from public, anon, authenticated;
revoke all on public.ellis_private_workbench from service_role;
grant select, insert, update on public.ellis_private_workbench to service_role;
