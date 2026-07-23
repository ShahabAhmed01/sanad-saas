# Sanad

Multi-tenant SaaS for Pakistani schools — attendance, fees, exams, parent portal.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **State:** TanStack Query, Zustand
- **Email:** Resend

## Quick Start

**Prerequisites:** Node.js 22+, a Supabase project, Resend API key.

```bash
cp .env.example .env.local   # fill in your keys
npm install
npm run dev
```

Visit `http://localhost:3000/setup` to initialize the admin account.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (also typechecks) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |

## Project Structure

```
sanad/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (app)/        # Authenticated modules (21 pages)
│   │   ├── (parent)/     # Parent portal (6 pages)
│   │   └── api/          # API routes
│   ├── components/       # Reusable components + shadcn/ui
│   ├── lib/              # Supabase clients, utils, themes, email
│   └── i18n/             # English + Urdu translations
├── supabase/
│   └── migrations/       # SQL migrations (run in order)
└── public/               # Static assets
```

## Features

- Auth (email/password, magic link, session management)
- Dashboard (role-based: admin, teacher, accountant, etc.)
- Attendance (student + staff, keyboard shortcuts)
- Fees (structure, invoicing, collection, defaulter tracking)
- Exams (scheduling, marks entry, PDF report cards)
- Library (catalog, issue/return, fines)
- Transport (routes, student assignment)
- Homework (assignment, submission, tracking)
- Announcements (school-wide, class-specific)
- Notifications (real-time, in-app)
- Parent Portal (child selector, attendance, marks, fees, homework)
- Platform Admin (cross-tenant management)
- i18n — English + Urdu with RTL support
- 4 themes (Noor Classic, Emerald Dusk, Warm Sand, Midnight Royal)
- Dark mode

## Database

37 tables with Row-Level Security across 9 domains. Migrations live in `supabase/migrations/` and must be run in order via the Supabase SQL Editor.

## Deployment

**Vercel (primary):** Connect repo, set root directory to `sanad/`, add env vars, deploy. See [DEPLOY.md](DEPLOY.md).

**Docker:**

```bash
# Local build
docker compose up -d

# Production (from GHCR)
docker compose -f docker-compose.prod.yml up -d
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `SUPABASE_DB_PASSWORD` | Yes | Database password for migrations |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the app |
| `SETUP_TOKEN` | Yes | One-time token for initial admin creation |

## Testing

Vitest with jsdom environment. Test files in `src/**/*.test.{ts,tsx}`.

```bash
npm run test
```
