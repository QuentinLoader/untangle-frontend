# Backend request: admin usage reset

The Untangle web app cannot reset free-plan usage — usage is owned by the backend
service on Railway. This is the exact contract the frontend expects if/when it is added.

## Endpoint

`POST /api/v1/admin/usage/reset`

Auth: normal Supabase bearer token (same as every other authenticated call), plus a
server-side check that the caller is an admin (allow-list of user IDs/emails in a Railway
env var, e.g. `ADMIN_USER_EMAILS`). Non-admins get `403`.

### Request body

```json
{ "email": "quentin.loader@gmail.com", "period": "2026-09" }
```

- `email` optional — defaults to the authenticated caller.
- `period` optional — defaults to the current calendar month.

### Success response `200`

```json
{ "email": "quentin.loader@gmail.com", "period": "2026-09", "used": 0, "limit": 3 }
```

### Errors

- `403` `{ "code": "FORBIDDEN", "message": "Admin access required." }`
- `404` `{ "code": "USER_NOT_FOUND", "message": "No account for that email." }`

## What it must do

Delete (or zero) this period's successful-analysis usage rows for the target user so the
entitlement endpoint reports `used: 0`. It must not change the plan, the free limit, or any
Plus entitlement.

## Notes

- Today `GET /api/v1/entitlements` reports 16 used against a free limit of 3 for
  quentin.loader@gmail.com; the app clamps the display to "3 of 3" but the account is still
  blocked from analysing.
- Separate open backend issue: LeaseCheck Ask returns HTTP 422 `AI_LEASE_ASK_INPUT_REJECTED`
  for every question, including the suggested ones.
