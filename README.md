# Ellis — portfolio host for [tybuilds.tech](https://tybuilds.tech)

**Ellis** is a conversational portfolio host: a third-person guide who helps visitors assess fit with a builder's work — not a resume brochure, not a sales bot.

This repo is the Next.js app behind tybuilds.tech. Ellis boots knowing **himself**; knowledge about the builder is earned through onboarding, then served from an approved shelf — never invented at runtime.

## What this is

- **Ellis Hall** — chat-first entry where visitors explore work through conversation
- **Project rooms** — Tonal Learning, Basement CRT, Gardens of Eridu (tease), linked from the hall
- **Excited halls** — role-specific entry points (e.g. `/anthropic`) when a visitor has a known context
- **Behavioral architecture** — 7-day rolling visitor recall, rate limits, honest seams (no fake continuity)

## What this isn't

- Not a CMS-driven resume site
- Not full Gardens of Eridu — GoE stays a tease here, not a leak (that repo is private)
- Not a permanent visitor profile — recall is IP-hashed, 7 days from last contact, then compressed into anonymous traces

## Status

Active build. **Phase A complete.** Phase B (interior + visitor recall) landed 2026-08-19; the honesty pass on public copy and the spend ceiling shipped the same day.

Open: the `about-ty` knowledge shelf is partially filled. `facts.json` holds repo-verifiable
claims; `earnest.md` and `goe-teach.md` are drafts pending replacement by Ellis's own onboarding
interview, so what he knows about Ty is still secondhand.

Architecture and build docs live in [`docs/`](./docs/). Maintainer notes: [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md).

## Local development

**Requirements:** Node.js 20+, npm

```bash
git clone https://github.com/tybuildstech/Ellis.git
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
| `NEXT_PUBLIC_SUPABASE_*` | Public mode | GoE project API keys — `ellis_usage` only ([supabase/README.md](./supabase/README.md)) |
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

## Docs map

| Doc | Purpose |
| --- | ------- |
| [ARCHITECTURAL_DOCTRINE.md](./docs/building/ARCHITECTURAL_DOCTRINE.md) | Why Ellis exists |
| [BUILD_CHECKLIST.md](./docs/building/BUILD_CHECKLIST.md) | Implementation order |
| [RESEARCH_LOG.md](./docs/building/RESEARCH_LOG.md) | Decisions, rationale, design impact |
| [DEBUG_LOG.md](./docs/building/DEBUG_LOG.md) | Build incidents and smoke checks |
| [ELLIS_ME_BUILD.md](./docs/building/ELLIS_ME_BUILD.md) | Ellis mind + chat spec |
| [ELLIS_PRIVATE_LIFE.md](./docs/building/ELLIS_PRIVATE_LIFE.md) | Consolidation boundary and private backroom direction |
| [STYLE.md](./docs/building/STYLE.md) | Visual system |

## Related projects

| Project | Repo |
| ------- | ---- |
| Basement CRT | [tybuildstech/CRT](https://github.com/tybuildstech/CRT) |
| Gardens of Eridu | private |
| Ashe | private |
| Tonal Learning | private |

## Author

Built by [Tytianna Bennett](https://tybuilds.tech) — systems for language learning, inhabited AI, and honest interfaces.
