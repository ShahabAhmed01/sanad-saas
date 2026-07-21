# Sanad Deployment Guide

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/ShahabAhmed01/sanad-saas.git
cd sanad-saas

# 2. Copy environment file
cp .env.example .env.local

# 3. Edit .env.local with your keys (see below)

# 4. Run with Docker
docker-compose up -d

# 5. Open http://localhost:3000/setup
```

## Environment Variables

Get these from your service dashboards:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., https://sanad.pk) |

## Database Setup

1. Go to https://supabase.com/dashboard/project/frxfrehusnvpggxrtwom/sql/new
2. Run these 3 files in order (copy-paste each, click Run):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_plans.sql`
3. Visit http://localhost:3000/setup to create your Platform Admin account

## Vercel Deployment

1. Go to https://vercel.com/new
2. Import the GitHub repo: `ShahabAhmed01/sanad-saas`
3. Add environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy — Vercel will auto-deploy on every push to main

## Resend Setup

1. Go to https://resend.com
2. Create an API key
3. Add `RESEND_API_KEY` to your environment variables
4. Verify your domain (sanad.pk) in Resend Dashboard → Domains

## Payment Gateway (Rapid)

1. Sign up at https://rapidgateway.pk
2. Get your API key
3. Add to `.env.local`:
   ```
   RAPID_GATEWAY_API_KEY=your-key
   RAPID_GATEWAY_URL=https://api.rapidgateway.pk
   ```
4. The gateway is already integrated — just needs the API key

## What's Built

- 32 routes across all modules
- 37 database tables with RLS
- School signup, staff invitation, parent portal
- Fee management with PDF receipts
- Attendance, exams, library, transport
- Email notifications via Resend
- Docker containerization
- Payment gateway abstraction (manual + Rapid)
