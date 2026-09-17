# LeaseCheck mobile summary refinement

## Goal
Make the existing LeaseCheck Summary feel like one calm, guided answer on mobile while preserving all backend-driven facts, W15B semantics, navigation, and unrelated products.

## Changes
- Keep the current identity header and single white Summary surface.
- Refine spacing, separators, heading rhythm, and compact fact rows so sections A–J read as one continuous explanation rather than separate report blocks.
- Group regular payments, initiation fee, monthly service fee, and deposit under “What you are paying”.
- Keep backend-provided overall and supporting cost figures under “What this could cost”, with `TOTAL_AMOUNT_REPAYABLE` retaining strongest emphasis and no duplicated figures.
- Preserve family-aware end-position, early-ending, default, responsibilities, protections, and suggested-question wording.
- Keep Full details and Ask behavior/content unchanged unless a tiny presentation-only consistency adjustment proves necessary.

## Technical details
- Limit implementation to `src/routes/result.tsx` unless visual verification exposes a necessary consistency issue.
- Preserve the existing financial labels, combined balloon/residual deduplication, optional-product filtering, status handling, and zero-arithmetic rendering.
- Do not change APIs, types, flags, routes, authentication, billing, legal logic, or other products.

## Validation
- Run formatting/type checks and confirm the preview build signal.
- Verify LeaseCheck at approximately 393px: no horizontal overflow, internal codes, or duplicated financial facts.
- Confirm the section sequence and total-amount-repayable emphasis visually.
- Confirm TaxSnap rendering remains unchanged.
- Do not publish.
