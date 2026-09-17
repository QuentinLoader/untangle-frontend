# LeaseCheck unified Summary

## Goal
Turn the existing LeaseCheck Summary into one coherent, mobile-first explanation while keeping the current Summary, Full details, and Ask navigation and all backend-driven facts unchanged.

## Changes
- Replace the separate Summary cards with one primary “Your lease in plain English” container.
- Organise that container into a consistent sequence: agreement identity, key payments, backend financial impact, end-of-term position, early ending, default consequences, customer responsibilities, other-party responsibilities, useful protections, and contextual Ask questions.
- Reuse only existing document, terms, clause, responsibility, rights, and `financialImpact` values; do not calculate, infer, or broaden facts.
- Keep family-specific language for residential, commercial, vehicle, equipment, and unknown agreements.
- Prevent repeated amounts and facts within Summary, including separating early-termination/default figures from scheduled-cost figures.
- Keep detailed wording, formulas, missing inputs, validation warnings, evidence, legal interpretation, and sources in Full details, with Legal details last and collapsed.
- Preserve the existing grounded Ask experience and all unrelated product behaviour.

## Technical details
- Limit implementation primarily to `src/routes/result.tsx`.
- Add small presentation helpers for section headings, contextual questions, financial grouping, and supported end/default language.
- Do not change result types, API calls, feature flags, routing, authentication, or backend contracts.

## Validation
- Check current diagnostics and the production build signal.
- Verify mobile rendering at 393px for residential, commercial, vehicle, and equipment-style payloads, including no horizontal scrolling or exposed taxonomy codes.
- Confirm Full details retains the prior extracted and legal content and Ask remains mounted.
