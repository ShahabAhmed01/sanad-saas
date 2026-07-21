# Sanad (سند)

A production-grade, multi-tenant SaaS platform for Pakistani schools and academies to manage staff, students, attendance, fees, exams, and parent communication.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **State:** TanStack Query + Zustand
- **Email:** Resend
- **PDF:** @react-pdf/renderer
- **Charts:** Recharts

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your Supabase keys
2. Run `npm install`
3. Run `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npx next build --webpack
```

## Project Structure

```
src/
├── app/              # Pages and routes
├── components/       # Reusable UI components
├── lib/              # Utilities and Supabase helpers
└── middleware.ts     # Auth session refresh
```
