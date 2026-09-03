# Apply L04-L06 frontend

Expected frontend baseline: S01 merged customer-facing six-solution suite with T04.2 human-first TaxSnap result UX.

Recommended branch:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/l05-leasecheck-result-ux
```

Copy these frontend files into the frontend repository root, preserving paths:

- `src/lib/documents.ts`
- `src/routes/result.tsx`

Then run:

```powershell
git status
npm run build
```

LeaseCheck result rendering is implemented, but the LeaseCheck solution card intentionally remains **Coming soon**. Do not change it to Available until the L06 real-document release gate passes and production has `LEASECHECK_ENABLED=true`.
