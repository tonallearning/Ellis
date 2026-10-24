# Ellis — portfolio host for [tybuilds.tech](https://tybuilds.tech)

**Ellis** is a conversational portfolio host: a third-person guide who helps visitors assess fit with a builder's work — not a resume brochure, not a sales bot.

This repo is the Next.js app behind tybuilds.tech. Ellis has a reviewed public
knowledge shelf about Ty's work and a separate, owner-only private room. A
conversation does not automatically publish a new fact about her.

## What this is

- **Ellis Hall** — chat-first entry where visitors explore work through conversation
- **Public hall** — bounded visitor recall and role-aware conversation about Ty's work
- **Private room** — owner-gated contact that does not turn its relationships into public evidence
- **Behavioral architecture** — a persistent Ellis, explicit limits, and a seam between outward expression and private cause

## What this isn't

- Not a CMS-driven resume site
- Not full Gardens of Eridu — GoE stays a tease here, not a leak (that repo is private)
- Not a permanent visitor profile — recall is IP-hashed, 7 days from last contact, then compressed into anonymous traces

## Status

Active build. The public hall and owner-gated private room are implemented;
live behavior and deployment-specific checks still require manual verification.
The [public design record](./docs/public/DESIGN_RECORD.md) explains selected
decisions and evidence limits. Internal build diaries are not part of this
public checkout.

## Local development

**Requirements:** Node.js 20+, npm

```bash
git clone https://github.com/tonallearning/Ellis.git
cd Ellis
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `NEXT_PUBLIC_SITE_URL` | Yes | e.g. `http://localhost:3000` |
| `ELLIS_MODE` | Yes | `onboarding` (Ty-only) or `public` |
| `ANTHROPIC_API_KEY` | Phase B | Server-only; never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SUPABASE_*` | Public mode | Ellis project client configuration ([supabase/README.md](./supabase/README.md)) |
| `SUPABASE_SERVICE_ROLE_KEY` | Public mode | Server-only; never expose to client |
| `ELLIS_DAILY_BUDGET_USD` | Optional | Default `1` — per IP per UTC day |
| `ELLIS_IP_HASH_SALT` | Public mode | Salt for IP hashing in rate limiter |
| `ELLIS_ONBOARDING_SECRET` | Optional | Gate onboarding route in preview/prod |
| `ELLIS_TIME_ZONE` | Optional | Consolidation clock; defaults to `America/Chicago` |
| `ELLIS_CONSOLIDATION_START_HOUR` | Optional | Local whole hour when Ellis becomes unavailable; defaults to `2` |
| `ELLIS_CONSOLIDATION_END_HOUR` | Optional | Local whole hour when the hall reopens; defaults to `4` |

See [`.env.example`](./.env.example) for the full list.

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Next.js dev (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run format` | Prettier write |

## Stack

Next.js 16 · App Router · TypeScript · Tailwind CSS 4 · Vercel · Supabase (rate limits) · Anthropic Claude

## Design record

Read [selected design decisions](./docs/public/DESIGN_RECORD.md) for the
reasoning behind Ellis and the limits of what this repository can verify.

## Related projects

| Project | Repo |
| ------- | ---- |
| Basement CRT | [tybuildstech/CRT](https://github.com/tybuildstech/CRT) |
| Gardens of Eridu | private |
| Ashe | private |
| Tonal Learning | private |

## Author

Built by [Tytianna Bennett](https://tybuilds.tech) — systems for language learning, inhabited AI, and honest interfaces.
