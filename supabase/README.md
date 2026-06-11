# Supabase — Ellis on GoE project

tybuilds uses **one table** on the Gardens of Eridu Supabase project: `ellis_usage`.

Ellis server code reads/writes **only** `ellis_usage` via `SUPABASE_SERVICE_ROLE_KEY`. It never touches GoE workshop, ME, or auth tables.

## Apply migration (once)

From this repo:

```bash
supabase login
supabase link --project-ref oubavruicijhxiqrlikr
supabase db push
```

Or paste `migrations/20260610000000_ellis_usage.sql` into the GoE project **SQL Editor** in the Supabase dashboard.

## Env (tybuilds / Vercel)

Copy from GoE project → **Settings → API**:

| Variable | Use |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Not used for rate limits; keep for future client-safe calls if any |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — rate limit upserts |

Optional before public mode:

| Variable | Default | Purpose |
| --- | --- | --- |
| `ELLIS_DAILY_BUDGET_USD` | `1` | Soft/hard cap per IP per UTC day |
| `ELLIS_IP_HASH_SALT` | (required in prod) | Salt for IP hashing |

## Verify

After push, in SQL Editor:

```sql
SELECT * FROM public.ellis_usage LIMIT 1;
```

Should return zero rows. Confirm RLS is on and anon cannot select:

```sql
SELECT relrowsecurity FROM pg_class WHERE relname = 'ellis_usage';
```
