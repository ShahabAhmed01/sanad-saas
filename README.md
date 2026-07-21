# Sanad (سند)

A production-grade, multi-tenant SaaS platform for Pakistani schools and academies to manage staff, students, attendance, fees, exams, and parent communication.

**Live:** https://sanadd.vercel.app

## Quick Start

```bash
git clone https://github.com/ShahabAhmed01/sanad-saas.git
cd sanad-saas
cp .env.example .env.local  # Fill in your keys
npm install
npm run dev
```

Then visit http://localhost:3000/setup to initialize the database.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **State:** TanStack Query + Zustand
- **Email:** Resend
- **Analytics:** Vercel Analytics + Speed Insights
- **PDF:** @react-pdf/renderer
- **Charts:** Recharts

## Features

- Multi-tenant SaaS (unlimited schools)
- 11 role-based dashboards
- Student/Staff management with CSV import
- Attendance tracking
- Fee management with invoice generation
- Exam scheduling and marks entry
- Library issue/return
- Transport route assignment
- Leave request/approval workflow
- Parent portal
- Platform admin panel
- Dark mode + 4 themes
- Docker containerization
- Vercel deployment

## Environment Variables

See `.env.example` for all required variables.

## License

Proprietary — All rights reserved.
