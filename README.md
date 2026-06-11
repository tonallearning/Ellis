# tybuilds.tech — Ellis

Portfolio host for Ty. Ellis boots knowing himself; he learns Ty through onboarding — not a pre-filled resume bot.

**Planning:** [PROJECT_MEMORY.md](./PROJECT_MEMORY.md) · [docs/building/BUILD_CHECKLIST.md](./docs/building/BUILD_CHECKLIST.md)

## Local dev

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Purpose                 |
| ------------------- | ----------------------- |
| `npm run dev`       | Next.js dev (Turbopack) |
| `npm run build`     | Production build        |
| `npm run lint`      | ESLint                  |
| `npm run typecheck` | TypeScript              |
| `npm run format`    | Prettier write          |

## Stack

Next.js 16 · App Router · TypeScript · Tailwind CSS 4 · Vercel · Supabase (rate limits) · Anthropic (Phase B)
