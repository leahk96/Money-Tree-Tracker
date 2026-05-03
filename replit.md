# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## Money Tree (`artifacts/money-tree`)

Gamified budget tracker — meet monthly savings goals to grow an animated tree.

### Tech stack
- React + Vite + Tailwind CSS
- Supabase (auth + database)
- Framer Motion (animations)
- Recharts (charts)
- GBP (£) only

### Environment secrets required
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

### Pages
- `/` — redirects to `/login` or `/tree`
- `/login`, `/signup`, `/forgot-password` — auth
- `/onboarding` — first-run goal setup (protected)
- `/budget`, `/budget/:year/:month` — main budget tracker (protected)
- `/tree` — animated money tree + quarterly badges (protected)
- `/garden` — yearly garden view (protected)
- `/summary`, `/summary/:year` — annual savings summary (protected)
- `/settings` — goal photo, password change, delete account (protected)
- `/demo`, `/tree-demo`, `/garden-demo`, `/summary-demo` — public demos

### Savings model
- `saved = income − expenses` (remaining balance = savings contribution)
- `amountLeftToSpend = saved − savingsGoal` (shown in right panel "Left to spend")
- Savings section in budget table is informational only (doesn't affect goal maths)

### Color palette
- Primary green: `#2E7D32`
- Secondary green: `#4CAF50`
- Background: `#FAFAFA`
- Gold accent: `#D4AF37`
- Bills: `#C62828`, Needs: `#1565C0`, Wants: `#E65100`, Debt: `#607D8B`

### Pre-deployment checklist
1. Run `artifacts/money-tree/supabase-setup.sql` in Supabase SQL Editor
2. Create storage bucket named `goal-photos` (public) in Supabase → Storage
3. Optionally disable email confirmation in Supabase → Authentication → Settings
4. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets are set
