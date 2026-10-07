# U00 — Production and Security Baseline

Status: PASS for code baseline; live-session checks remain part of release verification.
Date: 2026-10-07

## Purpose

U00 establishes the security boundary before the Untangle South Africa UX reset.

A returning user may remain signed in between visits. The security requirement is that protected customer and administrator functions still require a valid authenticated session and are enforced by the backend.

## Frontend route boundary

Public:
- /
- /landing
- /login
- /signup
- /forgot-password
- /reset-password
- /terms

Authenticated:
- /upload
- /processing/$documentId
- /result
- /vault
- /reminder
- /reminders
- /profile
- /upgrade
- /billing
- /solutions/$slug (current behaviour; public specialist acquisition routes are introduced later in U01/U04)

Protected routes use the shared route guard and redirect signed-out users to sign-in.

## Backend boundary

Code review confirms:
- customer APIs require the current authenticated user;
- document metadata, status and results are owner scoped;
- LeaseCheck Ask is owner scoped;
- document deletion is owner scoped;
- reminder records and referenced documents are user scoped;
- Vault and paid reminder/calendar functions use backend entitlement checks;
- administrator functions use the database-controlled ADMIN role;
- administrator role does not itself create paid-plan entitlement.

## Session policy

- Persisted login is intentional.
- Automatic session refresh is intentional.
- A failed refresh followed by another unauthorized backend response signs the browser out and returns it to sign-in.
- Password reset ends by signing the user out so the new password is used on the next normal login.
- Password entry on every visit is not required.

Recent re-authentication should be considered later for high-impact security/account/admin mutations rather than for normal app use.

## U00 configuration changes

The reset branch:
- ignores local environment files;
- removes the tracked stale environment file;
- adds a placeholder-only environment example;
- removes the legacy anonymous-key fallback;
- aligns the frontend user contract with backend role/status fields;
- removes the obsolete Lovable preview-session storage broker.

Remaining Lovable build tooling is intentionally deferred until the new shared shell is implemented, so U00 does not destabilise the application unnecessarily.

## Validation

- Vercel preview build for the reset branch: PASS.
- Existing backend role migration and full backend test suite: previously passed at the current backend baseline.
- Remaining production release checks: signed-out direct-route redirect, normal-user smoke, administrator smoke, expired-session smoke and production-domain upload/CORS verification.

## Decision

The code/security baseline is sufficiently controlled to continue the product and information-architecture reset.

Do not call the production security close-out complete until the remaining live-session checks are performed as part of the release gate.
