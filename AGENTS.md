# AGENTS.md

## Project Overview

**MyTradingView** — A stock options analysis tool built with Next.js for exploring and analyzing stock option data.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React 19, MUI 7, Emotion
- **Database:** PostgreSQL via Prisma 7
- **Auth:** NextAuth 5 (beta)
- **Data Sources:** Tradier API, Yahoo Finance, CBOE
- **Search:** Algolia (InstantSearch)
- **Charts:** Lightweight Charts, MUI X Charts, uPlot
- **State/URL:** nuqs (query state)
- **Realtime:** Socket.io client
- **Package Manager:** npm

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # React components
├── lib/          # Utilities, API clients, Prisma client
└── ...           # Additional modules

prisma/
├── schema.prisma # Database schema
└── migrations/   # Prisma migrations

openspec/         # OpenSpec change management
.opencode/        # OpenCode config (skills, commands)
```

## Development Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Generate Prisma | `npm run pgen` or `npx prisma generate` |
| DB migrate (dev) | `npm run pmigrate` |
| DB deploy | `npm run pdeploy` |

## Code Conventions

- Use **TypeScript** for all code — no `any` unless unavoidable
- Follow **MUI component patterns** — use `styled()` or `sx` prop consistently
- Keep components in `src/components/` — collocate page-specific components
- Use **nuqs** for URL search params (e.g., symbol state)
- API routes go in `src/app/api/`
- Use **Prisma** for all DB queries — avoid raw SQL
- **NEVER commit changes unless the user explicitly asks you to**

## Testing

- No formal test framework is currently configured
- Lint before committing: `npm run lint`

## Deployment

- Staging: `https://stage--mztrading.netlify.app/`
- Production: `https://mztrading.netlify.app/`
- Build triggers Prisma migrate deploy automatically

## Environment Variables

Key vars (see `.env.local_SAMPLE` for full list):

- `POSTGRES_PRISMA_URL` — Database connection
- `AUTH_SECRET` — NextAuth secret
- `TRADIER_TOKEN` — Tradier API key
- `TRADIER_BASE_URI` — Tradier API base URL
