# S01 — Final Untangle Solution Suite

## Purpose
Align the customer-facing Untangle frontend to the agreed suite:

1. TaxSnap — Available
2. LeaseCheck — Coming soon
3. WorkCheck — Coming soon
4. DebtCheck — Coming soon
5. PolicyCheck — Coming soon (insurance policy + claim decision in one module)
6. AARTOCheck — Coming soon

This removes DealCheck and ContactValidate from the customer-facing solution catalogue. It does not delete backend code or historical work for those concepts.

## Files changed
Copy these files into the frontend repository root, preserving paths:

- `src/lib/solutions.ts`
- `src/components/untangle/SolutionCard.tsx`
- `src/routes/index.tsx`
- `src/routes/solutions.$slug.tsx`

## Behaviour
- TaxSnap remains the only AVAILABLE solution.
- TaxSnap is positioned broadly around South African tax letters and notices.
- Coming-soon cards clearly state what each solution will help with.
- PolicyCheck includes insurance policy understanding and claim rejection/repudiation guidance in one customer-facing module.
- AARTOCheck replaces ambiguous FineCheck-style naming.
- All solution metadata now lives in one registry (`src/lib/solutions.ts`).
- Home and solution detail pages read from the same registry.
- Vault remains the only document repository.
- No backend, database, AI model or entitlement changes are included.

## Verification
From `untangle-frontend`:

```powershell
git status
npm run build
```

Expected: production build succeeds.

Then verify in the app:

- Home shows the six solutions in the agreed order.
- TaxSnap = Available.
- LeaseCheck, WorkCheck, DebtCheck, PolicyCheck, AARTOCheck = Coming soon.
- DealCheck and ContactValidate are no longer shown on Home.
- Each card opens its correct solution detail page.
- TaxSnap CTA still opens Analyse with TaxSnap context.
- Coming-soon solution pages do not allow analysis.
