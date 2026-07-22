# Sanad Deployment Guide

Complete deployment guide for Vercel, Docker, Supabase, and GitHub.

---

## Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Supabase account](https://supabase.com)
- [Vercel account](https://vercel.com)
- [GitHub account](https://github.com)
- [Resend account](https://resend.com) (for emails)

---

## 1. Database Setup (Supabase)

### Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization, set project name, database password, region (AWS ap-southeast-1 for Pakistan)
4. Wait for project to initialize (~2 minutes)

### Run Migrations
1. Go to SQL Editor: `https://supabase.com/dashboard/project/<your-project>/sql/new`
2. Run these 3 files **in order** (copy-paste each, click Run):

```
supabase/migrations/001_initial_schema.sql    (37 tables + indexes)
supabase/migrations/002_rls_policies.sql      (RLS policies)
supabase/migrations/003_seed_plans.sql         (5 pricing plans)
```

Or run the combined file:
```
supabase/RUN_ALL_MIGRATIONS.sql
```

### Get API Keys
1. Go to Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to Settings → Database
4. Copy **Database password** → `SUPABASE_DB_PASSWORD`

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role |
| `SUPABASE_DB_PASSWORD` | Supabase Dashboard → Settings → Database → Password |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., https://sanadd.vercel.app) |

---

## 3. Vercel Deployment (Recommended)

### Connect Repository
1. Go to https://vercel.com/new
2. Import GitHub repo: `ShahabAhmed01/sanad-saas`
3. Framework: Next.js (auto-detected)
4. Root directory: **leave empty** (default `/`)
5. Build command: `npm run build` (auto-detected)
6. Install command: `npm ci` (auto-detected)

### Add Environment Variables
1. In Vercel Dashboard → Settings → Environment Variables
2. Add all variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL` = `https://sanadd.vercel.app`
3. Set environment to **Production**, **Preview**, and **Development**

### Deploy
1. Click "Deploy"
2. Vercel auto-deploys on every push to `main`
3. Preview deployments on every pull request

### Custom Domain (Optional)
1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `sanad.pk`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your domain

---

## 4. Docker Deployment

### Local Development
```bash
# Clone and configure
git clone https://github.com/ShahabAhmed01/sanad-saas.git
cd sanad-saas
cp .env.example .env.local
# Edit .env.local with your keys

# Build and run
docker compose up -d

# Open http://localhost:3000/setup
```

### Production (Self-Hosted)
```bash
# Pull from GitHub Container Registry
docker compose -f docker-compose.prod.yml up -d

# Or build locally
docker compose build
docker compose up -d
```

### Using Pre-built Image
```bash
# Latest image from GitHub Container Registry
docker pull ghcr.io/shahabahmed01/sanad:latest

# Run with environment variables
docker run -d \
  --name sanad-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e RESEND_API_KEY=your-key \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  --restart always \
  ghcr.io/shahabahmed01/sanad:latest
```

---

## 5. GitHub Setup

### Repository Secrets (for CI/CD)
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### GitHub Container Registry
1. The Docker workflow automatically pushes to `ghcr.io`
2. Image URL: `ghcr.io/shahabahmed01/sanad:latest`
3. No additional setup needed (uses `GITHUB_TOKEN`)

### Branch Protection (Recommended)
1. Settings → Branches → Add rule for `main`
2. Require pull request reviews
3. Require status checks (lint, typecheck, test, build)
4. Require branches to be up to date

---

## 6. Post-Deployment Setup

### Create Platform Admin
1. Visit `https://your-domain.com/setup`
2. Enter admin email, password, and name
3. Click "Create Admin"

### Create First School
1. Visit `https://your-domain.com/signup`
2. Enter school details
3. 21-day free trial starts automatically

---

## 7. Resend Setup (Email)

1. Go to https://resend.com
2. Create an API key
3. Add `RESEND_API_KEY` to environment variables
4. Verify your domain in Resend Dashboard → Domains
5. Update the "from" email in `src/lib/email/resend.ts`

---

## 8. Payment Gateway (Rapid — Optional)

1. Sign up at https://rapidgateway.pk
2. Get your API key
3. Add to environment variables:
   ```
   RAPID_GATEWAY_API_KEY=your-key
   RAPID_GATEWAY_URL=https://api.rapidgateway.pk
   ```
4. The gateway abstraction is already integrated

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub     │────▶│    Vercel     │────▶│  Supabase   │
│  (Source)    │     │  (Deploy)     │     │  (Backend)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                     │
       │              ┌────┴────┐           ┌────┴────┐
       │              │  DNS/   │           │ Postgres │
       └──────────────│  CDN    │           │ Auth     │
                      └─────────┘           │ Storage  │
                                            └─────────┘

Docker (Alternative):
┌─────────────┐     ┌──────────────┐
│   GitHub     │────▶│   Docker     │
│  (Source)    │     │  (GHCR)      │
└─────────────┘     └──────┬───────┘
                           │
                      ┌────┴────┐
                      │  Your   │
                      │  VPS/   │
                      │  Server │
                      └─────────┘
```

---

## Health Check

- **Endpoint:** `GET /api/health`
- **Returns:** `{ status: "ok", services: { app: "ok", database: "ok" } }`
- **Used by:** Docker HEALTHCHECK, monitoring tools

---

## Troubleshooting

### Build fails on Vercel
- Check environment variables are set for all environments
- Ensure `sanad/` is set as root directory

### Docker build fails
- Ensure Docker 20.10+ is installed
- Check `.env.local` exists with valid keys

### Database connection errors
- Verify Supabase URL and keys
- Check if RLS policies are enabled
- Ensure service role key is set for admin operations

### 401/403 errors
- Check middleware is running (Supabase env vars must be set)
- Verify user has correct role in `staff` table
- Check RLS policies in Supabase dashboard
