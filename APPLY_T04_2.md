# Untangle T04.2 — Mobile UX Cleanup

Baseline expected before applying:

- Frontend main: `b04dfcf` (`merge: T04.1 human-first results`)
- Backend main: `cf59f5a` (`merge: T04.1 SARS knowledge and human guidance`)
- Both working trees clean.

## Scope

T04.2 is deliberately small. It does **not** change the AI model, database schema, billing backend, or add new modules.

### Frontend

- Uses South African English **Analyse** consistently.
- Removes the duplicate Recent TaxSnap document list from the solution page; Vault remains the document home.
- Moves the solution CTA directly below the TaxSnap introduction and shortens the solution page.
- Compacts the Analyse/upload screen for phone use.
- Hides the large Plus usage message on Home; Free users still see their monthly usage.
- Makes the Home Vault shortcut smaller.
- Keeps Vault delete confirmation and shortens long document titles to two lines.
- Improves the empty Reminders state with an **Analyse a document** action.
- Removes the confusing customer-facing Account Type row and hides an unset Name.
- Makes billing explicit: Plus is R79 for one month and does not renew automatically.
- Active Plus users see their access end date and can add another month for R79.
- Removes redundant billing navigation/actions.
- Removes duplicated “Where to submit/respond” when the numbered action steps already include the destination.
- Makes validation warnings more specific and keeps reference-number-only checks in More details rather than interrupting the main result.
- Removes repeated risk text and limits professional-help prompts to cases where they add real value.
- Displays `Company Income Tax (CIT)` for CIT results, including already-saved results whose older payload says `other`.

### Backend

- Ensures a recognised CIT final-verification document is classified as `income_tax` even when the AI did not explicitly return `TAX_TYPE`.
- Ensures a recognised Customs suspension is classified as `customs_excise` for the same reason.
- Adds one regression test for the CIT fallback.

## Apply — Backend

From `C:\Users\Quent\OneDrive\Documents\GitHub\untangle-backend`:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/t04-2-mobile-ux
```

Copy the **contents** of this pack's `backend\` folder into the backend repository root, preserving folders and allowing overwrite.

Then run:

```powershell
git status
npm test
```

Expected: the existing 12 tests plus the new T04.2 regression test = **13 tests, 13 pass, 0 fail**.

Do not merge yet if the suite is not green.

## Apply — Frontend

From `C:\Users\Quent\OneDrive\Documents\GitHub\untangle-frontend`:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/t04-2-mobile-ux
```

Copy the **contents** of this pack's `frontend\` folder into the frontend repository root, preserving folders and allowing overwrite.

Then run:

```powershell
git status
npm run build
```

The production build must complete without errors.

## Verify in the app

Check these items on a phone-width viewport:

1. Bottom navigation says **Analyse**.
2. Home has no duplicated document list and no large Plus usage card for an active Plus user.
3. TaxSnap page shows its Analyse CTA immediately and no Recent TaxSnap Activity list.
4. Analyse screen is compact and keeps Take a photo / Choose from files obvious.
5. Vault is the only document list; Delete asks for confirmation before permanent deletion.
6. Reminders empty state offers Analyse a document.
7. Account no longer shows `Account type: Individual` or `Name: Not set`.
8. Billing says Plus does **not** renew automatically and explains the current access end date / one-month renewal.
9. CIT More details shows **Company Income Tax (CIT)** rather than `other`.
10. TaxSnap results do not repeat a separate Where to submit card when the action steps already provide the route.

## Commit after verification

Backend:

```powershell
git add .
git commit -m "feat: clean up Untangle mobile UX and CIT classification"
git push -u origin feature/t04-2-mobile-ux
```

Frontend:

```powershell
git add .
git commit -m "feat: streamline Untangle mobile UX"
git push -u origin feature/t04-2-mobile-ux
```
