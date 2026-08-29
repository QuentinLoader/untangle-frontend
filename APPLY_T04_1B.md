# Untangle T04.1B — Human Guidance Frontend

This update is for the existing `feature/t04-human-first` frontend branch after T04.

## Files updated

- `src/lib/documents.ts`
- `src/routes/result.tsx`

## What it changes

The mobile TaxSnap result now prioritises:

1. **What this is** — including business/personal context where known.
2. **What SARS wants** — separated from general SARS guidance.
3. **Do this next** — numbered practical steps.
4. **What you need** — only documents/items actually requested; where known, explains what the item is and where to get it.
5. **What you still need to check** — used when the current letter refers to missing/earlier information instead of inventing it.
6. **Where to submit / respond**.
7. **When** — exact deadline only when supported.
8. **More details** — rights, risks, source guidance, technical checks and disclaimer.

The frontend remains backward-compatible with older stored results where the new T04.1 guidance fields are absent.

## Apply

Extract this ZIP directly into the root of `untangle-frontend`, allowing these files to replace the existing versions.

Then run:

```powershell
git status
npm run build
```

Do not commit until the build succeeds.
