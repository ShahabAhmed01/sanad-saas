# Sanad SaaS — Complete Technical & Product Audit
**Repository:** github.com/ShahabAhmed01/sanad-saas | **Audit date:** July 23, 2026
**Method:** Full clone + hands-on verification — dependencies installed, TypeScript compiled, ESLint run, full test suite executed, every RLS policy read line-by-line, WCAG contrast ratios computed mathematically, every claim in the project's own docs checked against the actual code.

---

## How to read this report

Every finding below was *verified*, not guessed. Severity tags: **🔴 Critical** (fix immediately, exploitable today) · **🟠 High** (fix before real users) · **🟡 Medium** (fix before charging money) · **🔵 Low** (polish) · **✅ Strength** (genuinely well done, keep it).

---

## 1. Context: How This Was Built

The repo contains its own internal documents — `AI_Agent_Handoff.md` and `S_TIER_IMPLEMENTATION_SUMMARY.md` — written by an AI coding agent. They claim:
- "**All 12 phases complete** — 100% complete — 49 routes, 37 tables, all features functional"
- A checklist including **"[x] Keyboard focus and WCAG AA contrast verified"**
- An S-tier score improvement from **5.5/10 → 8/10**

Git history: **30 commits, every single one dated July 21–23, 2026** — a three-day span.

## 2. 🔴 Critical & High Security Findings

### 🔴 CRITICAL — Payment webhook has no real signature verification
**File:** `src/lib/payments/gateway.ts`, `RapidGateway.handleWebhook()`
Signature verification only executes if both signature header is present AND API key is configured. `RAPID_GATEWAY_API_KEY` is optional, meaning verification never runs.
**Fix:** Make signature verification mandatory, not conditional.

### 🟠 HIGH — Landing page displays fabricated usage statistics
**File:** `src/app/page.tsx`, lines 102–105 and 435
Hardcoded static strings claiming "50+ Schools Onboarded", "12,000+ Students Managed", "99.9% Uptime", "4.9/5 User Rating".
**Fix:** Delete or clearly-label the fabricated landing page stats.

### 🟠 HIGH — Self-signup has no email verification, no bot protection, no rate limiting
**File:** `src/lib/actions/auth.ts`, `signupSchool()`
`email_confirm: true` auto-confirms without email verification. No rate limiting anywhere in codebase.
**Fix:** Enable real email verification, add rate limiting (Upstash), add CAPTCHA.

### 🟠 HIGH — Admin panel route is public in middleware
**File:** `src/lib/supabase/middleware.ts`
`/platform` is in publicPaths allowlist.
**Fix:** Remove `/platform` from `publicPaths`.

### 🟠 HIGH — CSP is configured to do almost nothing
**File:** `next.config.ts`
`'unsafe-inline'` + `'unsafe-eval'` in script-src defeats CSP's primary purpose.
**Fix:** Move to nonce- or hash-based CSP.

### 🟡 MEDIUM — Fee search builds raw filter string from user input
**File:** `src/app/(app)/fees/collect/page.tsx`
User search text interpolated into PostgREST filter string.
**Fix:** Use parameterized filter builders.

### 🟡 MEDIUM — Invited-staff temp passwords have predictable structure
**File:** `src/lib/actions/auth.ts`
`crypto.randomUUID().slice(0, 12) + "A1!"` — fixed suffix reduces entropy.
**Fix:** Use proper random generator, add `must_change_password` flag.

### 🟡 MEDIUM — Dependency vulnerabilities: 8 total, 2 high severity
`sharp` < 0.35.0 HIGH, `postcss` < 8.5.10 MODERATE.
CI runs `npm install --no-audit`.
**Fix:** Run `npm audit fix`, add Dependabot config.

### ✅ Strength — Row-Level Security is genuinely well-architected
All 38 tables have RLS enabled. 146 policies using correct patterns.

## 3. Features & Functionality: Claimed vs. Real

### 🔴 Audit logging — built correctly, wired to nothing
`logAudit()` is called in exactly one place — its own unit test. Never called from any real page, form, or mutation.

### 🔴 i18n — English + Urdu, RTL support — do not function
Real translations exist, provider exists, toggle component exists — but zero of 49 page files call `useI18n()`. LanguageToggle is never rendered.

### ✅ Theme system actually works end-to-end

### 🟡 Fee collection has real business-logic bugs
1. Stale amount pre-fill on partial payments
2. No transaction atomicity
3. No guard against negative or over-limit amounts
4. No idempotency/locking against double-counting

### 🟡 CSV student import: fragile parser, no batching, silent failures

## 4. UI/UX, Color Scheme & Accessibility

### ✅ Design system foundations — genuinely above average
"Ink / Paper / Seal Gold" palette, proper CSS custom-property architecture, dark mode, `prefers-reduced-motion` respected.

### 🟠 Signature accent color fails WCAG AA for actual text use
White text on Accent-gold button: 4.18:1 ratio (needs 4.5). Accent-gold text on Paper: 3.87:1.

### Accessibility: Only 9 of 99 component/page files use `aria-label`

### Responsiveness: Only 18 of 59 page/layout files use any responsive breakpoint class, only 2 files wrap tables in `overflow-x-auto`

## 5. Code Quality & Engineering Practices

### ✅ TypeScript discipline is genuinely excellent — zero `any`
### ✅ Linting is clean — 0 errors, 4 warnings
### 🟠 Tests exist, pass, and test almost nothing that matters
57 tests, all passing — but only testing utility modules, not pages, API routes, auth, or business logic.

### ✅ CI/CD pipeline is solid, with one real gap
Docker workflow doesn't depend on CI passing.

### ✅ Dockerfile is genuinely well-built

## 6. Database & Architecture

- 38 tables, 146 RLS policies — strongest layer
- No database transactions for multi-step writes
- No server-side business-rule validation layer (Zod used in only 4 of ~90 relevant files)

## 7. Honest Scorecard

| Dimension | Claimed | Verified |
|-----------|---------|----------|
| Security | 8/10 | **4/10** |
| Localization | 7/10 | **1/10** |
| UI/UX | 8.5/10 | **6.5/10** |
| Landing Page | 8/10 | **4/10** |
| Code Quality | *(not scored)* | **8.5/10** |
| Database/RLS | *(not scored)* | **8/10** |
| Test Coverage | *(not scored)* | **2/10** |
| **Overall** | **8/10** | **~5/10** |

## 8. The S-Tier Roadmap — Prioritized, Actionable

### P0 — Do before this touches any real money or real user data
1. Fix the payment webhook — make signature verification unconditional
2. Delete or clearly-label fabricated landing page stats
3. Remove `/platform` from middleware's public-path allowlist
4. Disable `/api/setup`'s admin-creation path once platform admin exists

### P1 — Do before calling this "production-ready"
5. Add rate limiting to login, signup, forgot-password, setup
6. Turn on real email verification
7. Fix the CSP — move to nonce-based, drop unsafe-eval
8. Fix fee-collection bugs
9. Run npm audit fix, add Dependabot
10. Add must_change_password flag for invited staff

### P2 — Do before calling this "complete"
11. Finish i18n or remove the claim
12. Wire logAudit() into ~40 mutation points
13. Rewrite CSV importer with real parser and batch inserts
14. Run RLS cross-tenant test
15. Real mobile QA pass
16. Fix accent-gold contrast failure
17. Gate Docker-publish on CI passing

### P3 — Genuine S-tier differentiation
18. Add real integration/E2E tests (Playwright)
19. Wire Supabase Realtime subscriptions
20. Add structured server-side logging (Sentry)
21. Add proper server-side validation layer (use Zod consistently)
22. Third-party penetration test

### Bottom line
High ceiling, real foundations — but a critical open vulnerability and two non-functional headline features mean it is not currently what the internal docs claim it is. Fix the P0 list this week, and you'll close the gap between "looks S-tier" and "is S-tier."
