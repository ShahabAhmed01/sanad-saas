# Sanad (سند)

A production-grade, multi-tenant SaaS platform for Pakistani schools and academies to manage staff, students, attendance, fees, exams, and parent communication.

[![CI](https://github.com/ShahabAhmed01/sanad-saas/actions/workflows/ci.yml/badge.svg)](https://github.com/ShahabAhmed01/sanad-saas/actions/workflows/ci.yml)
[![Docker](https://github.com/ShahabAhmed01/sanad-saas/actions/workflows/deploy-docker.yml/badge.svg)](https://github.com/ShahabAhmed01/sanad-saas/actions/workflows/deploy-docker.yml)
[![Vercel](https://vercel.com/badge?button=true)](https://sanadd.vercel.app)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

**Live:** https://sanadd.vercel.app | **Docker:** `ghcr.io/shahabahmed01/sanad:latest`

---

## Quick Start

```bash
# Clone
git clone https://github.com/ShahabAhmed01/sanad-saas.git
cd sanad-saas

# Configure
cp .env.example .env.local
# Edit .env.local with your Supabase + Resend keys

# Install & Run
npm install
npm run dev

# Visit http://localhost:3000/setup to initialize
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| State | TanStack Query + Zustand |
| Email | Resend |
| PDF | @react-pdf/renderer |
| Charts | Recharts |
| Analytics | Vercel Analytics + Speed Insights |
| CI/CD | GitHub Actions |
| Containers | Docker (Node 22 Alpine) |
| Deployment | Vercel (primary) / Docker (self-hosted) |

## Features

- **Multi-tenant SaaS** — Unlimited schools, isolated data via RLS
- **11 Role-based Dashboards** — School admin, principal, teacher, accountant, front desk, HR, librarian, transport coordinator, exam controller, parent, platform admin
- **Student & Staff Management** — CSV import, role assignment, profiles
- **Attendance Tracking** — Student + staff, keyboard shortcuts, real-time
- **Fee Management** — Structure, invoices, collection, defaulter tracking
- **Exam & Grading** — Scheduling, marks entry, report cards (PDF)
- **Library** — Book catalog, issue/return, fine tracking
- **Transport** — Route management, student assignment
- **HR & Leave** — Request/approval workflow
- **Communication** — Announcements, homework, notifications
- **Parent Portal** — Child selector, attendance, marks, fees, homework
- **Platform Admin** — Cross-tenant management, subscription verification
- **Payment Gateway** — Manual (bank/JazzCash/Easypaisa) + Rapid Gateway
- **Email Notifications** — Welcome, invitations, fee reminders via Resend
- **Pakistani Calendar** — Gregorian + Hijri, national/Islamic holidays
- **i18n** — English + Urdu, RTL support
- **4 Premium Themes** — Noor Classic, Emerald Dusk, Warm Sand, Midnight Royal
- **Dark Mode** — Full dark mode support
- **Command Palette** — Cmd+K global search with 22 commands
- **Onboarding Wizard** — 4-step Stripe-like setup flow
- **Security** — CSP headers, HSTS, RLS, audit logging

## Deployment

### Vercel (Recommended)
See [DEPLOY.md](DEPLOY.md) for complete guide.

```bash
# 1. Connect GitHub repo to Vercel
# 2. Root directory: leave empty (default /)
# 3. Add environment variables
# 4. Deploy
```

### Docker
```bash
# Local
docker compose up -d

# Production (from GHCR)
docker compose -f docker-compose.prod.yml up -d
```

### Self-Hosted
```bash
# Build and run
docker build -t sanad ./sanad
docker run -d -p 3000:3000 --env-file sanad/.env.local sanad
```

## Environment Variables

See [`.env.example`](sanad/.env.example) for all required variables.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) |
| `SUPABASE_DB_PASSWORD` | Database password for migrations |
| `RESEND_API_KEY` | Transactional email API key |
| `NEXT_PUBLIC_APP_URL` | Application public URL |

## Database

37 tables with Row-Level Security (RLS) across 9 domains:
- Platform, Staff, Academic, Students, Attendance, Exams, Finance, Library, Transport

Run migrations via Supabase SQL Editor (see [DEPLOY.md](DEPLOY.md)).

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run test:watch   # Run tests in watch mode
npm run setup        # Setup database via API
```

## Project Structure

```
sanad/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (app)/        # Authenticated app (21 modules)
│   │   ├── (parent)/     # Parent portal (6 pages)
│   │   ├── api/          # API routes (health, setup, webhook)
│   │   └── ...           # Public pages (login, signup, landing)
│   ├── components/       # Reusable components
│   │   ├── layout/       # App shell, sidebar, navigation
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Shared libraries
│   │   ├── supabase/     # Client, server, admin, middleware
│   │   ├── email/        # Resend integration
│   │   ├── payments/     # Payment gateway abstraction
│   │   └── ...           # Utils, themes, calendar, audit
│   └── i18n/             # Internationalization (EN + UR)
├── supabase/             # Database migrations + seeds
├── scripts/              # Utility scripts
└── public/               # Static assets
```

## License

Proprietary — All rights reserved.
