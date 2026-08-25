# Untangle TaxSnap T02/T03 — apply guide

These replacement packs are based on the frontend and backend ZIPs supplied for this Untangle session.

## 1. Backend first

Repository: `untangle-backend`

You should already be on `taxsnap-v1-verification` at baseline `ccc8ae3`.

Verify before copying:

```powershell
git status
git branch --show-current
git log -1 --oneline
```

Extract `untangle-t02-t03-backend-update.zip` into the backend repository root and allow the listed files to overwrite the existing files.

Then run:

```powershell
npm test
```

Expected test count after this batch: **10 tests** (the existing 4 plus 6 TaxSnap T02 regression tests), all passing.

Do not deploy yet if any test fails. Send the failure output back for correction.

## 2. Frontend second

Repository: `untangle-frontend`

Create an isolated branch before replacing files:

```powershell
git status
git switch -c taxsnap-mobile-t02-t03
```

Extract `untangle-t02-t03-frontend-update.zip` into the frontend repository root and allow the listed files to overwrite the existing files.

This frontend pack includes the earlier FE01 navigation/account/billing/solutions improvements as well as the T02 mobile-first TaxSnap result screen.

Build it:

```powershell
npm run build
```

Do not overwrite your `.env` file. The update pack contains no environment file.

## 3. T02 live retest

Use Lovable Preview first; do not publish yet.

Upload the same two SARS documents again. TaxSnap should now distinguish:

- Customs suspension: already suspended, suspension/decision dates, operational consequence, remediation, 30-day appeal period, DA51, appeal/reasons rights, and no invented exact appeal due date.
- CIT verification final request: urgent final request, requested documents, Request for Correction option, and no invented response deadline.

## 4. T03 extraction benchmark

The backend now contains a private live extraction evaluator. Real SARS PDFs are deliberately not included in the source package.

Create these local files in `eval/private/`:

- `customs-suspension.pdf`
- `cit-verification-final-request.pdf`

Then, with `ANTHROPIC_API_KEY` available locally:

```powershell
npm run eval:taxsnap
```

The current model is used by default. To compare multiple Anthropic model IDs without changing production:

```powershell
$env:TAXSNAP_EVAL_MODELS="model-id-1,model-id-2"
npm run eval:taxsnap
```

The full field-level score is written to `eval/output/`. Both `eval/private/` and `eval/output/` are gitignored.

Production TaxSnap extraction can now be configured separately using `ANTHROPIC_TAX_MODEL`. Do **not** change that Railway variable until the benchmark proves another model is better.
