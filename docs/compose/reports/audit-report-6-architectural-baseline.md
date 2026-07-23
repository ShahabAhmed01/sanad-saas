# Architectural Baseline and Technical Synthesis

## System Component Analysis

| Component | Current Baseline | Bottleneck | S-Tier Requirement |
|-----------|-----------------|------------|-------------------|
| Backend Framework | FastAPI with Slowapi | Synchronous blocking during PDF export | Fully async with Celery + Redis queues |
| Data Architecture | Single-database with app-level token mapping | No database-level multi-tenant isolation | PostgreSQL RLS or schema-per-tenant |
| Frontend UI/UX | Dark theme with glassmorphism | High GPU rendering, WCAG contrast failures | Multi-theme token engine meeting WCAG 2.2 AAA |
| Real-Time Layer | SSE with polling fallback | Memory leaks during connection dropouts | Bi-directional WebSockets with Redis Pub/Sub |
| Export Engines | Jinja2 + WeasyPrint | CPU-bound PDF rendering blocking HTTP threads | Sandboxed isolated worker clusters |
| Localization | Static LTR layouts | Visual breakage under RTL transformations | Native CSS Logical Properties for fluid RTL/LTR |

## Visual Identity & Accessibility

### Color System Requirements
- Deterministic, tokenized design variables (not arbitrary opacity overlays)
- Support Light, Dark, and High Contrast modes
- All text must meet WCAG 2.2 AA minimum (4.5:1 for normal text)

### Layout Requirements
- 8-point spatial grid system
- CSS Logical Properties for RTL/LTR support
- Responsive fluid layout with proper overflow handling

## Security Vulnerabilities

| Vector | Severity | Root Cause | Remediation |
|--------|----------|------------|-------------|
| PDF SSRF File Exfiltration | Critical | Unsanitized asset URLs in WeasyPrint | Restrict URLFetcher to HTTPS outbound proxies |
| Application Tenant Leakage | High | App-level SQL WHERE clause filtering | PostgreSQL RLS bound to session context |
| Corporate NAT Rate Blocking | Medium | Static IP rate limiting | Redis Token-Bucket scoped by tenant/user |
| XSS | High | Unescaped Markdown rendering | DOMPurify + strict CSP headers |
| Insecure Token Handling | High | JWTs in browser localStorage | HttpOnly, Secure cookies only |

## Functional Capability Gaps

### Required for Enterprise SaaS
1. Outbound webhook engine (HMAC-SHA256 signature verification)
2. Bi-directional WebSockets for real-time multi-user sync
3. Dynamic entitlement system checking tenant subscription metadata
4. Structured audit logging in append-only tables

## Phased Transformation Roadmap

### Phase 1: Zero-Trust Security (Weeks 1-4)
- Enforce PostgreSQL RLS across all tenant-scoped tables
- Isolate PDF rendering in network-isolated container
- Upgrade to OAuth2/OIDC with SAML 2.0 SSO
- Replace IP-bound rate limiting with Redis Token Bucket

### Phase 2: Design System & Accessibility (Weeks 5-8)
- Rebuild around semantic CSS design token framework
- Refactor to CSS Logical Properties
- Apply 8-point spatial grid system
- Implement accessible inline form validation

### Phase 3: High-Performance Data Pipeline (Weeks 9-12)
- Offload heavy operations to async background workers
- Upgrade real-time layer to WebSockets + Redis Pub/Sub
- Integrate Zustand + React Query for client state
- Implement strict memory management

### Phase 4: Enterprise Integrations (Weeks 13-16)
- Deploy outbound webhook engine
- Implement dynamic entitlement system
- Establish structured audit logging
- Integrate automated security scanning

## Architectural Comparison

| Vector | Current Baseline | S-Tier Target |
|--------|-----------------|---------------|
| Tenant Isolation | App-level WHERE clause | PostgreSQL RLS |
| Document Generation | Synchronous WeasyPrint | Isolated async workers |
| Visual Architecture | Fixed dark glassmorphism | WCAG 2.2 AAA multi-theme tokens |
| Localization | LTR-only CSS overrides | Native CSS Logical Properties |
| Real-Time | Unidirectional SSE | Bi-directional WebSockets |
| Rate Limiting | Static IP-bound | Redis Token Bucket (User + Tenant) |
| State Management | Full-page reloads | Zustand + React Query |
| Audit Trails | Text logs | Append-only JSON logs |
