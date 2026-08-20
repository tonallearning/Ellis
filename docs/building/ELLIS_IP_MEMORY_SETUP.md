# Ellis IP Memory — Quick Setup

**Status:** Phase B.11 complete. Ready to deploy.

---

## 1. Run Supabase Migrations

```bash
# Option A: Local dev (Supabase CLI)
npx supabase migration up

# Option B: Vercel (automatic on deploy)
# Migrations run automatically on the hosted Supabase instance

# Verify (via Supabase dashboard):
# → Tables:
#   - ellis_visitor_memory (new)
#   - ellis_global_traces (new)
#   - ellis_usage (extended with is_return_visit)
# → Check indexes exist
```

---

## 2. Add Environment Variables

### `.env.local` (local dev)
```bash
# IP hashing salt (generate random)
ELLIS_IP_HASH_SALT=$(openssl rand -hex 32)

# Cron token (generate random)
CRON_SECRET=$(openssl rand -hex 32)
```

### Vercel (production)
```bash
vercel env add ELLIS_IP_HASH_SALT
vercel env add CRON_SECRET
# (or use Vercel dashboard → Settings → Environment Variables)
```

---

## 3. Update Vercel Cron Config

Add to `vercel.json` or `vercel.ts`:

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/decay-ip-memory",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**vercel.ts:**
```typescript
import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  crons: [
    routes.cron('/api/cron/decay-ip-memory', { schedule: '0 0 * * *' }),
  ],
};
```

---

## 4. Test Migrations

```bash
# Connect to Supabase CLI
supabase db pull --local

# Verify tables exist locally
supabase db tables

# Expected output:
# ellis_visitor_memory
# ellis_global_traces
# ellis_usage (with is_return_visit column)
```

---

## 5. Next: Phase B.12 Integration

Wire IP memory into `src/app/api/ellis/stream/route.ts`:

1. Import functions
2. Extract/hash visitor IP
3. Load IP memory
4. Pass to `assembleEllisInterior()`
5. Record visit after stream

See: `docs/building/ELLIS_IP_MEMORY_IMPLEMENTATION.md` § Integration Checklist

---

## 6. Deploy

```bash
# Commit migration files + new code
git add supabase/migrations/ src/lib/ellis/memory/ src/app/api/cron/ src/lib/ellis/ipMemoryIntegration.ts
git commit -m "feat: 7-day IP visitor memory + global traces (Phase B.11)"

# Push + deploy
git push
vercel deploy

# Monitor: Vercel Logs → check for migration success
```

---

## Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20260611000000_ellis_visitor_memory.sql` | Tables + indexes + RLS |
| `supabase/migrations/20260611000001_ellis_usage_extend.sql` | Extend ellis_usage |
| `src/lib/ellis/memory/ipMemory.ts` | Load, record, label, mark |
| `src/lib/ellis/memory/decayIpMemory.ts` | Decay job (compress → delete) |
| `src/app/api/cron/decay-ip-memory.ts` | Cron endpoint |
| `src/lib/ellis/ipMemoryIntegration.ts` | Hash, extract, build beats/summary |
| `src/lib/ellis/me/assemble.ts` | Updated to inject IP memory |
| `docs/building/ELLIS_IP_MEMORY_IMPLEMENTATION.md` | Full setup guide |

---

## Verify Locally

```bash
# Start dev server
npm run dev

# Test cron endpoint (if CRON_SECRET set)
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/decay-ip-memory

# Expected response (if tables exist):
# { "ok": true, "message": "Decayed X expired IP records...", "processed": 0 }
```

---

Done. Ready for Phase B.12 integration into stream route.
