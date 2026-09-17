# LeaseCheck financial impact presentation

## Goal
Show the backend-provided financial impact clearly in the existing LeaseCheck Summary and Full details, without calculating, inferring, or altering any values.

## Changes
- Extend the LeaseCheck result type with the optional `lease-financial-impact-v1` response, including nullable amounts, statuses, explanations, formulas, missing inputs, and warnings.
- Add a compact Summary section, “What this agreement could cost you,” after the current payment card.
- Present returned figures by customer importance: regular payment, scheduled payments, estimated scheduled commitment, balloon/residual, deposit, optional purchase amount, early termination, per-remaining-payment termination charge, and default exposure.
- Format returned cents as currency only; show partial-estimate wording and useful missing inputs; never calculate or assume currency, periods, tax, dates, or totals.
- Avoid repeating matching financial-impact items in the existing Summary payment card while retaining unrelated extracted money terms.
- Add a collapsed “How these figures were worked out” section in Full details with backend explanations, formulas, useful missing inputs, and quiet warnings; never show source field keys.
- Hide both additions when the backend supplies no useful financial-impact content.

## Validation
- Type-check and inspect current diagnostics.
- Verify mobile layouts for calculated, partial, not-calculable, nullable-currency, and missing financial-impact cases.
- Confirm Summary has no duplicated financial figures and Full details retains the existing LeaseCheck content.
