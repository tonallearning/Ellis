# Supabase — Ellis's own project

Ellis used to be a guest on the Gardens of Eridu project, holding a single
`ellis_usage` table there. He now has his own project. GoE is a private world
build with its own residents and its own retention problems; a public site that
strangers can reach should not share a database with it, and Ellis's tables had
already grown from one to four.

The existing public runtime owns these four tables:

| Table                  | Holds                                                                                                         | Lifetime                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `ellis_usage`          | Per-IP daily spend, for the rate limiter                                                                      | Per UTC day                         |
| `ellis_visitor_memory` | Episodic beats per visitor, keyed by salted IP hash — except Ty, whose row is `owner` and is skipped by decay | 7 days inactivity; owner indefinite |
| `ellis_global_traces`  | Compressed patterns left after a visitor memory expires; no PII                                               | Indefinite                          |
| `ellis_body`           | Ellis's own interior — pulse and gut. One row, never expires                                                  | Indefinite                          |

The split matters: `ellis_visitor_memory` expires so Ellis does not hold onto
people, while `ellis_body` persists because it holds what meeting them did to
him. The second contains no visitor content and identifies nobody.

Every table has RLS enabled with no policies and is revoked from `anon` and
`authenticated`. Server code reaches them only through
`SUPABASE_SERVICE_ROLE_KEY`.

Memory writes go through `ellis_memory_append`, a service-role-only RPC. It
locks one memory key, appends the new beats, and keeps the most recent 200 beats
for Ty's `owner` row or 40 for a seven-day visitor row. Direct upserts must not
replace `episodic_beats`; that was the original lost-memory bug.

## P3 private memory (local, not deployed)

`20261017231203_ellis_private_memory.sql` adds `ellis_private_exchanges`,
`ellis_relation_memory`, and content-free retry tombstones in
`ellis_private_deletions`. These are independent of visitor recall. The owner-
gated repository uses `ellis_private_memory` for relation-scoped reads,
completed-pair commits, linked inbound corrections, and deletion/rebuild.
No public route imports it; P4 supplies runtime integration.

`npm test` executes this exact migration in embedded Postgres (PGlite) and
checks populated isolation, RLS/grants, corrections, deletion, and retries.
It does not contact the remote project. Before production activation, complete
the backup/deletion recovery gates in
[PRIVATE_MEMORY_RETENTION.md](../docs/building/PRIVATE_MEMORY_RETENTION.md)
and run deployment advisors and concurrent-session smoke checks.

## Applying migrations

Migrations are ordered by filename. Apply each once and track applied versions;
the P3 migration is transactional but not rerunnable. Never replay the full
bundle against an existing database. P3 is currently local-only.

**Dashboard (no CLI needed).** For a new, empty database only, copy the bundle
in order into the project's SQL Editor after reviewing every migration:

```bash
cat supabase/migrations/*.sql | pbcopy
```

The paste must begin with `-- Ellis / tybuilds.tech`. If it begins with `>`, npm's
run banner got copied into the buffer and Postgres will reject it at line 2 —
use the bare `cat` above, or `npm run --silent db:bundle`.

**CLI.**

```bash
supabase login
supabase link --project-ref <ellis-project-ref>
supabase db push
```

## Environment

From the project's **Settings → API**:

| Variable                        | Use                                                        |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Unused today; kept for any future client-safe call         |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Server only.** Every table above is reached through this |

These must be set in Vercel for Production as well as locally. Pointing
production at the old GoE project after this move would silently split Ellis's
memory across two databases.

## Verifying

```sql
select table_name
from information_schema.tables
where table_schema = 'public' and table_name like 'ellis_%'
order by table_name;
-- expect: ellis_body, ellis_global_traces, ellis_usage, ellis_visitor_memory
-- after deliberate P3 deployment: also ellis_private_exchanges,
-- ellis_relation_memory, ellis_private_deletions

select id, pulse->>'state' as pulse_state, gut->>'arousal' as arousal
from public.ellis_body;
-- expect exactly one row, id = 'ellis'

select proname
from pg_proc
where proname in ('ellis_usage_increment', 'ellis_memory_append')
order by proname;
-- expect both rows: spend must bind and memory must append rather than replace
```

That last check is not decorative. The spend gate silently failed open for
weeks because `ellis_usage_increment` was defined in a migration that had never
been applied, so every recorded cost was dropped on the floor.
