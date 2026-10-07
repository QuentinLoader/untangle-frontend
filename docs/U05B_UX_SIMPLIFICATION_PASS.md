# U05B — UX Simplification Pass

Status: IMPLEMENTED FOR REVIEW
Date: 2026-10-07

## Product-owner feedback addressed

The first reset was directionally better but still too information-heavy, repetitive and visually similar across specialist products.

This pass applies one rule:

> Every screen has one primary job. If content does not help that job, remove it or move it elsewhere.

## Home

Home now focuses on:
- greeting;
- specialist product choice;
- anything that needs attention;
- recent documents;
- one generic upload path when the user does not know which specialist tool to choose.

Removed from Home:
- repeated Untangle South Africa label above the greeting;
- the permanent educational sidebar;
- repeated AddVision footer/trust copy;
- large generic “Understand a document” explainer card.

The service-unavailable message remains but is deliberately quieter and shorter.

## Specialist identity

TaxSnap:
- subtle warm/red accent;
- SARS/tax identity remains visible;
- concise specialist proposition.

LeaseCheck:
- forest/green accent;
- agreement/lease identity remains visible;
- concise specialist proposition.

They remain part of one Untangle South Africa design family rather than becoming separate brands.

## TaxSnap entry

Reduced to:
- product identity;
- “Understand what SARS wants from you”;
- one short explanation;
- one primary action;
- reassurance that the user does not need to know the SARS document type;
- three short supporting points only.

## LeaseCheck entry

Reduced to:
- product identity;
- one clear proposition;
- one primary action;
- compact “Before I sign” / “I already have an agreement” context;
- three short supporting points only.

## Upload

Upload now has one job: choose and send the document.

Kept:
- specialist identity;
- accepted file guidance;
- one dominant upload control;
- short privacy reassurance;
- current entitlement and upload behaviour.

Removed:
- long “what happens next” panels;
- repeated trust explanations;
- side-panel education.

## Processing

Processing now has one job: show understandable progress.

Kept:
- product identity;
- plain-language product-aware steps;
- elapsed time;
- fail-closed review/error states;
- backend polling as source of truth.

Removed:
- repeated education;
- repeated privacy/trust panels;
- explanatory side rail.

No fake percentage is shown.

## Public landing flash

The public landing page now renders a neutral loading state while authentication is unresolved or a valid signed-in session exists.

This prevents the public hero/forest scene from flashing before an authenticated redirect completes.

The public landing page still remains available to genuinely signed-out visitors.

## Unchanged

- backend APIs;
- document analysis logic;
- billing;
- Supabase session persistence;
- PolicyCheck activation;
- WorkCheck;
- detailed TaxSnap and LeaseCheck result contracts.

Detailed result screens remain the correct place for deeper information.
