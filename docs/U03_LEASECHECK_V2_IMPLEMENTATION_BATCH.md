# U03 Implementation Batch — LeaseCheck V2 Prototype

Status: READY
Depends on: U02 components

## Goal

Create a realistic authenticated design prototype that proves the new responsive LeaseCheck experience before replacing the production result route.

## Route to add

`src/routes/prototype.leasecheck-v2.tsx`

Expected route:
`/prototype/leasecheck-v2`

Requirements:
- authenticated;
- not linked from customer navigation;
- static synthetic demo data only;
- no backend mutation;
- no billing/entitlement change;
- no PolicyCheck activation.

## Demo scenario

Use a synthetic 72-month vehicle agreement with fixed displayed values:
- monthly payment: R9,649.47;
- term: 72 months;
- final balloon/residual: R147,475.00;
- total amount repayable: R842,236.84.

These are presentation fixtures. Do not derive or recalculate them in the frontend.

## Mobile order

1. LeaseCheck / portfolio identity.
2. “Here’s what this agreement means for you.”
3. Four key metrics.
4. Three consequence-led points before signing.
5. “What this means for you”.
6. Money.
7. Responsibilities.
8. Important clauses.
9. Ending the agreement.
10. If things go wrong.
11. Legal protections.
12. Evidence.
13. Ask.

## Desktop layout

Left rail:
- Summary
- Money
- Responsibilities
- Important clauses
- Ending
- Problems
- Legal protections
- Evidence
- Ask

Centre:
- active/full report content.

Right rail:
- document identity;
- “Check this” warnings;
- source/evidence shortcut;
- Ask shortcut;
- Untangle South Africa / AddVision trust line.

## Content requirements

The prototype must demonstrate the distinction:

### What the agreement says
Document fact/wording.

### What this means for you
Plain-language consequence.

### Legal/rule context
Separate checked guidance only.

Never merge those three into one unsupported statement.

## UX requirements

- Summary is decision-oriented, not a copy of every section.
- No duplicate display of the same money fact in adjacent layers.
- Evidence is accessible but secondary.
- “Urgent” is not used for routine contract review.
- Ask is visible but grounded and may remain non-working in prototype.
- No “AI says” wording.
- Professional report feel on desktop.
- Clear and calm on phone.

## Acceptance

- Vercel preview build passes.
- Route works at mobile and desktop widths.
- no production result route modified.
- no backend contract modified.
- no customer-facing navigation changed.
