# Security Policy

Sanad takes security seriously. This document outlines the security measures implemented across the platform and how to report vulnerabilities.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

- **Email:** security@sanad.pk
- **Do NOT** open public GitHub issues for security vulnerabilities
- We will acknowledge receipt within 48 hours and provide a resolution timeline within 7 days

## Security Measures

### Authentication & Authorization

- **Supabase Auth** with email/password and OAuth providers
- **Row-Level Security (RLS)** enforced on all 37 database tables — every query is scoped to the authenticated user's school and role
- **Role-based access control** with 9 staff roles (school_admin, principal, teacher, accountant, front_desk, hr_manager, librarian, transport_coordinator, exam_controller)
- **Platform admin** superuser role with unrestricted access for support
- **Guardian portal** with read-only access scoped to linked children
- **Session management** via Supabase SSR middleware — expired sessions are automatically refreshed; unauthenticated users are redirected to `/login`
- **Password policy:** Minimum 8 characters enforced via Zod validation
- **Staff invitations** use cryptographically secure 16-character generated passwords with enforced character diversity (uppercase, lowercase, digit, symbol) and `must_change_password` flag

### Rate Limiting

In-memory sliding window rate limiter applied at the middleware level:

| Endpoint | Limit | Window |
|---|---|---|
| Login | 5 attempts | 60 seconds |
| Signup | 3 attempts | 5 minutes |
| Forgot Password | 3 attempts | 5 minutes |
| Setup API | 5 attempts | 10 minutes |
| General API | 60 requests | 60 seconds |
| Audit API | 30 requests | 60 seconds |

Returns HTTP 429 with `Retry-After` header when exceeded.

> **Note:** Rate limiting is in-memory and resets on server restart. For multi-instance deployments, consider Upstash Redis.

### HTTP Security Headers

Applied to every route via Next.js configuration:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforce HTTPS for 2 years |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | Camera, microphone, geolocation, FLoC disabled | Restrict browser features |
| `Content-Security-Policy` | Strict CSP with `frame-ancestors 'none'` | Prevent XSS and data injection |

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' va.vercel-scripts.com vercel.speed-insights.com;
style-src 'self' 'unsafe-inline' fonts.googleapis.com;
img-src 'self' *.supabase.co data: blob:;
font-src 'self' fonts.gstatic.com;
connect-src 'self' *.supabase.co vitals.vercel-insights.com;
frame-ancestors 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

### Data Isolation

- **Multi-tenant architecture:** Every table has a `school_id` column with RLS policies enforcing `school_id = current_staff_school_id()`
- **Schools are completely isolated** — no cross-school data access is possible through the application layer
- **Database functions** (`current_staff_school_id()`, `current_staff_role()`, `has_role()`) are `SECURITY DEFINER` for consistent policy evaluation
- **Guardian access** is read-only and scoped to linked student records only

### Audit Logging

Two-layer audit system:

1. **Server-side logging** via admin client — records actor, school, action type, table, record ID, old/new values
2. **Client-side logging** via `/api/audit` endpoint — non-blocking for UI-initiated critical actions

Covered actions: create, update, delete, login, logout, password_change, role_change, fee_payment, fee_waiver, attendance_mark, exam_create, marks_entry, report_card_generate, data_export, settings_change, staff_invite, expense_add.

### API Security

- **Input validation** with Zod schemas on auth endpoints
- **SQL injection prevention** via Supabase query builder (parameterized queries)
- **CSRF protection** built into Next.js App Router Server Actions
- **Setup endpoint** protected by `SETUP_TOKEN` with constant-time comparison (`safeCompare`) to prevent timing attacks
- **Self-disabling setup:** Once a platform admin exists, the `create-admin` action returns 403
- **Payment webhook** validates `x-signature` header before processing

### Email Security

- Transactional emails via **Resend** API
- Email verification required for new accounts (`email_confirm: false`)
- Staff invitations include temporary passwords delivered via email

### Infrastructure

- **Vercel deployment** with automatic HTTPS and DDoS protection
- **Supabase** hosted PostgreSQL with built-in connection pooling and SSL
- **Standalone output** for Docker deployments
- **Environment variables** properly segregated (`NEXT_PUBLIC_` for client, server-only for secrets)

## Environment Variables

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes | Admin operations (bypasses RLS) |
| `RESEND_API_KEY` | Server only | Yes | Transactional email |
| `NEXT_PUBLIC_APP_URL` | Client + Server | Yes | Public application URL |
| `SETUP_TOKEN` | Server only | Yes | Initial admin creation |
| `RAPID_GATEWAY_API_KEY` | Server only | No | Payment gateway |

> **Warning:** Never commit `SUPABASE_SERVICE_ROLE_KEY` or `SETUP_TOKEN` to version control. Use `.env.local` for development and your deployment platform's secrets manager for production.

## Dependencies

Key security-related dependencies:

- `@supabase/ssr` — Server-side Supabase client with cookie-based auth
- `@supabase/supabase-js` — Supabase JavaScript client
- `zod` — Schema validation
- `next` — Framework with built-in CSRF protection and secure defaults

## Compliance Considerations

- **Data residency:** Supabase project should be configured in the appropriate region (e.g., AWS ap-southeast-1 for Pakistan)
- **Encryption at rest:** Enabled by default on Supabase (AES-256)
- **Encryption in transit:** TLS 1.2+ enforced via HSTS headers
- **Backup:** Supabase provides daily backups; consider point-in-time recovery for production
- **Data export:** Available via `/api/setup` endpoint for GDPR/data portability compliance

## Known Limitations

1. Rate limiting is in-memory — resets on server restart, not distributed across instances
2. CSP uses `'unsafe-inline'` for scripts — required by Next.js hydration; migration to nonce-based CSP is recommended
3. `X-XSS-Protection` header is deprecated by modern browsers
4. No DOMPurify or server-side HTML sanitization library — relies on React's built-in XSS protection
5. Password minimum length is 8 characters — consider increasing for high-security deployments

## Updates

This security policy is reviewed and updated quarterly. Last updated: July 2026.
