# U04 — TaxSnap and LeaseCheck Specialist Entry UX

Status: IMPLEMENTED
Date: 2026-10-07

## Purpose

Replace the old generic product-detail page for TaxSnap and LeaseCheck with product-specific customer journeys while keeping the approved Home, upload flow, result contracts and backend unchanged.

## TaxSnap

The entry experience now leads with the customer problem rather than a feature catalogue:

- received something from SARS;
- understand what it means;
- see what SARS wants;
- identify the important date;
- surface money involved;
- explain what happens if ignored.

Primary action: **Check my SARS document**.

The page explicitly tells users that they do not need to know which SARS document type they received before uploading.

Desktop adds a concise “After you upload” context panel and examples of supported SARS correspondence. Mobile keeps the same hierarchy in one readable column.

## LeaseCheck

LeaseCheck is intentionally different from TaxSnap.

The entry experience now separates two natural customer situations:

- **Before I sign**
- **I already have an agreement**

The page focuses on:

- money and total commitment;
- responsibilities;
- important clauses;
- ending the agreement;
- breach/default/cancellation/return/repossess consequences;
- legal protections only where safely applicable.

Primary action: **Check my agreement** when LeaseCheck is enabled.

## Result UX status

The production result route already dispatches to the approved specialist V2 result components:

- `TaxResultV2`
- `LeaseResultV2`

TaxSnap result sections currently include:
- summary;
- what this means;
- what SARS wants / what to do;
- dates and amounts;
- if you ignore it;
- rights and options;
- sources and checks.

LeaseCheck result sections currently include:
- summary;
- what this means;
- money;
- responsibilities;
- important clauses;
- ending the agreement;
- if things go wrong;
- legal protections;
- evidence;
- Ask.

No backend result contract or customer data model was changed in U04.

## Brand

Both specialist pages use:

**Product name → Part of Untangle South Africa → AddVision trust/footer**

AddVision is not presented as the primary consumer product name.

## Deferred

- Public specialist acquisition routes will be separated from authenticated product-entry routes later.
- PolicyCheck and WorkCheck remain simple coming-soon experiences until their respective UX/build stages.
- Further copy refinement can follow real-customer testing without changing the information architecture.
