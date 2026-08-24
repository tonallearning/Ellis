# Supabase — Ellis's own project

Ellis used to be a guest on the Gardens of Eridu project, holding a single
`ellis_usage` table there. He now has his own project. GoE is a private world
build with its own residents and its own retention problems; a public site that
strangers can reach should not share a database with it, and Ellis's tables had
already grown from one to four.

Ellis owns four tables and nothing else lives beside them:

| Table                   | Holds                                                            | Lifetime            |
| ----------------------- | ---------------------------------------------------------------- | ------------------- |
| `ellis_usage`           | Per-IP daily spend, for the rate limiter                          | Per UTC day         |
| `ellis_visitor_memory`  | Episodic beats per visitor, keyed by salted IP hash — except Ty, whose row is `owner` and is skipped by decay | 7 days inactivity; owner indefinite |
| `ellis_global_traces`   | Compressed patterns left after a visitor memory expires; no PII   | Indefinite          |
| `ellis_body`            | Ellis's own interior — pulse and gut. One row, never expires      | Indefinite          |

The split matters: `ellis_visitor_memory` expires so Ellis does not hold onto
people, while `ellis_body` persists because it holds what meeting them did to
him. The second contains no visitor content and identifies nobody.

Every table has RLS enabled with no policies and is revoked from `anon` and
`authenticated`. Server code reaches them only through
`SUPABASE_SERVICE_ROLE_KEY`.

## Applying migrations

Migrations are ordered by filename and every one is idempotent, so re-running
the full set is safe.

**Dashboard (no CLI needed).** Copy all of them in order and paste into the
project's SQL Editor:

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

| Variable                        | Use                                                       |
| ------------------------------- | --------------------------------------------------------- |
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

select id, pulse->>'state' as pulse_state, gut->>'arousal' as arousal
from public.ellis_body;
-- expect exactly one row, id = 'ellis'

select proname from pg_proc where proname = 'ellis_usage_increment';
-- must return a row, or spend is never recorded and the ceiling never binds
```

That last check is not decorative. The spend gate silently failed open for
weeks because `ellis_usage_increment` was defined in a migration that had never
been applied, so every recorded cost was dropped on the floor.
