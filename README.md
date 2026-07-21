# Sanad (سند)

A production-grade, multi-tenant SaaS platform for Pakistani schools and academies to manage staff, students, attendance, fees, exams, and parent communication.

## Features

- **Multi-tenant** — each school gets an isolated workspace
- **Role-based access** — 11 roles with strict permission boundaries
- **Real-time** — live dashboard updates via Supabase Realtime
- **Mobile-first** — responsive design for phones and desktops
- **Email notifications** — branded emails via Resend
- **Payment gateway** — manual (JazzCash/Easypaisa) + Rapid Gateway ready
- **Docker** — containerized deployment

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **State:** TanStack Query + Zustand
- **Email:** Resend
- **PDF:** @react-pdf/renderer
- **Charts:** Recharts

## Quick Start

```bash
# Clone
git clone https://github.com/ShahabAhmed01/sanad-saas.git
cd sanad-saas

# Install
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase keys

# Run
npm run dev
```

Open http://localhost:3000/setup to initialize the database.

## Docker

```bash
docker-compose up -d
```

## Database Setup

1. Run the 3 SQL files in Supabase SQL Editor
2. Visit `/setup` to create your admin account

## Project Structure

```
src/
├── app/                    # Pages and routes
│   ├── (app)/              # Authenticated routes
│   ├── (parent)/           # Parent portal
│   ├── api/                # API routes
│   ├── login/              # Auth pages
│   ├── signup/
│   └── payment/            # Payment flow
├── components/             # UI components
│   ├── layout/             # App shell, sidebar, nav
│   └── ui/                 # shadcn/ui + custom components
├── lib/                    # Utilities
│   ├── actions/            # Server actions
│   ├── email/              # Resend integration
│   ├── payments/           # Payment gateway
│   └── supabase/           # Database clients
supabase/
└── migrations/             # SQL migrations
```

## License

Proprietary — All rights reserved.
