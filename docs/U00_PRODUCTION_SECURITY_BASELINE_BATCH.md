# U00 — Production & Security Baseline — Implementation Batch

Status: APPROVED FOR IMPLEMENTATION
Portfolio: Untangle South Africa
Company: AddVision
Repositories:
- Frontend: `QuentinLoader/untangle-frontend`
- Backend: `QuentinLoader/untangle-backend`

## Objective

Establish and prove the security boundary before the UX rebuild. The user may remain signed in across visits; persistent sessions are acceptable. What must be proven is that no protected customer or administrative resource is accessible without a valid authenticated session and that paid capabilities are enforced by the backend.

## Current code observations to preserve

- The frontend uses Supabase persisted sessions with `persistSession: true` and `autoRefreshToken: true`. This explains why a returning user may not be asked for a password on every visit.
- Signed-out visitors to `/` receive the public landing page.
- Protected frontend routes use `ProtectedRoute` / `withAuth`.
- Backend `requireCurrentUser` requires a Bearer token, verifies it with Supabase and rejects non-ACTIVE Untangle accounts.
- Backend `requireAdmin` requires the database-controlled `ADMIN` role.
- Plus entitlements are resolved from subscriptions; ADMIN role does not itself create Plus access.
- The backend route catalogue marks documents/results/home/vault/reminders/usage/entitlements/billing checkout as authenticated and admin operations as admin-only.

These observations are not a substitute for testing the actual registered routes.

## Security contract

### Anonymous / no valid session
May access:
- public landing pages
- public product information
- public educational content
- public pricing/plan catalogue
- health/readiness endpoints where operationally required

Must not access:
- document metadata or files
- analysis results
- Ask
- Vault/history
- reminders
- user account/profile data
- usage/entitlements
- checkout creation tied to a user
- admin operations

Expected API response for protected resources: 401.

### Authenticated USER
May access:
- only their own documents/results/history
- their own profile, usage and entitlements
- product functions permitted by their plan and product release gates

Must not:
- access another user's document by guessing/changing an ID
- call admin routes
- bypass Free/Plus restrictions by frontend manipulation

Expected cross-user access: 404 or 403 according to existing API convention, with no information leakage.

### Authenticated PLUS user
Receives only the capabilities granted by active subscription entitlements.
Backend must enforce Plus-only features regardless of frontend state.

### Authenticated ADMIN
May access explicitly admin-authorized operations.
ADMIN does **not** automatically mean PLUS unless a separate approved entitlement rule exists.

### Expired / invalid / revoked session
Protected requests fail closed and frontend returns the user to sign-in rather than rendering stale protected data.

## U00 implementation tasks

1. **Route inventory**
   - Enumerate every customer-facing frontend route.
   - Mark each PUBLIC / AUTH / PLUS / ADMIN.
   - Enumerate every backend route and compare actual middleware to `src/api/route-catalog.ts`.
   - Treat catalogue/implementation mismatch as a defect.

2. **Authentication tests**
   Add focused tests for:
   - missing Authorization header
   - malformed Bearer header
   - invalid/expired token
   - inactive user
   - normal USER
   - ADMIN
   - session logout / client cache clearing where practical

3. **Ownership tests**
   Prove a signed-in user cannot fetch, delete, reprocess, ask questions about or otherwise operate on another user's document.
   Include at minimum:
   - document metadata
   - document status
   - result
   - Ask
   - delete
   - reminders where they reference owned documents

4. **Entitlement tests**
   Prove server-side enforcement for:
   - Free successful-analysis allowance
   - Vault
   - reminders/escalation where Plus-gated
   - calendar export
   - any other Plus-only capability currently implemented
   Confirm ADMIN role does not bypass these rules by accident.

5. **Frontend route guards**
   Confirm direct navigation to every protected route while signed out redirects to `/login`.
   Preserve requested return path safely.
   Do not rely on visual hiding alone.

6. **Session policy**
   Keep normal persisted login.
   Document:
   - normal session persistence
   - logout behaviour
   - expired-token behaviour
   - password reset behaviour
   - magic-link behaviour
   Identify actions that should require recent re-authentication in a later hardening batch, especially:
   - password/security changes
   - account deletion
   - high-impact admin actions
   Do not force password entry on every app visit.

7. **Configuration hygiene**
   Audit current Supabase/Vercel environment references.
   Remove stale old-project values from tracked source/config where safe.
   Ensure `.env` is not committed and provide a safe `.env.example`.
   Do not expose secrets in Git.
   Inspect `brokeredPreviewStorage`, Lovable preview-auth code and Lovable-specific Supabase messaging. Remove only what is proven obsolete and low-risk; otherwise record for U02/U04 cleanup.

8. **Security headers and browser handling**
   Review the current production frontend/backend security headers and CORS.
   Confirm the live custom domain is allowed and obsolete Lovable origins can be removed safely.
   Do not weaken CORS to wildcard origins.

9. **Admin verification**
   Verify `quentin@addvision.co.za` resolves to role `ADMIN`.
   Verify `quentin.loader@gmail.com` remains a normal user unless explicitly configured otherwise.
   Do not hard-code admin email in frontend or backend authorization.

10. **Production smoke checks**
   In an incognito/fresh session:
   - `/` → public landing
   - protected routes → login
   - signed-in normal user → own data only
   - admin user → admin-authorized operations only
   - invalid/expired token → protected API rejected

## Deliverable

Create `docs/U00_PRODUCTION_SECURITY_BASELINE.md` with:

- date and tested commit SHAs
- frontend route/security matrix
- backend route/security matrix
- session policy
- entitlement boundary
- ownership findings
- admin findings
- configuration findings
- fixes made
- test/build results
- residual risks
- PASS / PENDING decision

## Acceptance gate

U00 passes only when:

- protected backend routes fail closed without valid auth;
- ownership checks are proven for document/result/Ask/reminder operations;
- Plus-only features are backend enforced;
- ADMIN is backend controlled and does not accidentally grant paid entitlements;
- stale Supabase/config references do not create an alternate auth path;
- frontend direct-navigation guards work;
- test/build suites pass;
- production smoke checks pass.

Do not begin the U02/U03 visual rebuild while U00 is PENDING.
