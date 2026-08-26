# Untangle T04 — Frontend update

## Purpose
T04 applies the human-first, mobile-first Untangle rule to the live UX and makes Vault the single document-management area.

## Files
Copy these paths into the root of `untangle-frontend`, preserving folders:

- `src/lib/documents.ts`
- `src/routes/result.tsx`
- `src/routes/index.tsx`
- `src/routes/vault.tsx`

No environment-variable changes are required.

## Suggested safe workflow

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/t04-human-first
```

Extract this ZIP into the repository root and replace the files above.

Then run:

```powershell
git status
npm run build
```

## UX changes

### Result
The mobile result now prioritises only:
1. In plain English
2. Do this next
3. Where to go
4. When
5. Amount, only when relevant

Legal bases, detailed rights, risk references, professional-help guidance, document metadata and material validation details are collapsed under **More details**.

Low-value extraction notes such as an uncertain contact email no longer create a contradictory main-screen warning when the important result itself is high confidence.

### Home
Home no longer renders a second list of documents. It shows solutions, Analyze, reminders requiring attention, and a single link explaining that documents live in Vault.

### Vault
Vault is explicitly the single document area. Each document has a three-dot action menu with Open and Delete. Delete confirmation explains that the uploaded file, analysis and related reminders are removed from the user's Vault.
