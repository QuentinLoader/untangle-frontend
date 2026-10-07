# U03 — LeaseCheck V2 Responsive Prototype

Status: APPROVED FOR IMPLEMENTATION
Date: 2026-10-07

## Goal

Build a realistic, responsive LeaseCheck prototype that proves the new Untangle South Africa UX before replacing the production result route.

The prototype uses representative synthetic/demo data only and must not change the live LeaseCheck backend contract.

## Prototype route

Create a hidden authenticated route for design validation:

- /prototype/leasecheck-v2

Do not link it from normal customer navigation.

The route may use static representative data so the full UX can be reviewed even while AI credit or document fixtures are unavailable.

## Product identity

Header:

LeaseCheck
Part of Untangle South Africa

Supporting corporate identity may appear in footer/help:
Untangle South Africa is an AddVision product.

Avoid making AddVision the dominant app header brand.

## Representative demo scenario

Use a vehicle finance / lease-style agreement because it creates meaningful money, term, balloon/residual, responsibility and risk sections.

Demo values should be clearly synthetic and internally consistent.

Example shape:
- vehicle finance agreement;
- 72-month term;
- recurring monthly payment;
- initiation fee;
- service fee;
- final balloon/residual;
- total amount repayable;
- early termination wording;
- missed-payment consequence;
- insurance/maintenance responsibility;
- document evidence snippets.

Do not calculate new financial values in the frontend. All displayed demo values are fixed sample values.

## Mobile prototype

### Header
- back
- LeaseCheck
- portfolio line
- document status

### Summary
Headline:
“Here’s what this agreement means for you”

Key metrics:
- monthly payment;
- term;
- total amount repayable;
- final balloon/residual.

Then:
“3 things to understand before you sign”

Each point must be consequence-led, for example:
- a large amount remains at the end;
- ending early may still cost money;
- missed payments can lead to enforcement and extra cost.

Primary CTA:
“See what this means for me”

### What this means for you
Short explanatory sections:
- Your real payment commitment
- The final balloon/residual
- If you end it early
- If you miss payments

No repeated metric cards unless the number is essential to the explanation.

### Detailed sections
- Money
- Your responsibilities
- Other party responsibilities
- Important clauses
- Ending the agreement
- If things go wrong
- Legal protections
- Evidence

Use section dividers and fact rows rather than a wall of identical cards.

### Ask
A visible grounded Ask panel:
“Ask LeaseCheck about this agreement”

Include example starter prompts:
- “What happens if I settle early?”
- “Explain the balloon payment simply.”
- “What am I responsible for if the vehicle is damaged?”

For the prototype, Ask may be a non-working design state or use the existing capability only if safely wired.

## Desktop prototype

Three-column workspace:

Left:
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
- active section content;
- professional report typography;
- major key metrics and explanation.

Right:
- document identity;
- important warnings;
- evidence/source preview;
- Ask shortcut.

The right rail may become sticky on wide screens.

## Evidence pattern

Evidence should answer:
“Where did Untangle get this?”

Each evidence item may show:
- source label;
- page/section;
- short original wording;
- “Show more” disclosure.

Separate:
1. What your agreement says
2. Relevant checked legal/rule guidance
3. What this means for you

Never visually merge those into one unsupported conclusion.

## Warning pattern

Use two levels:

Check this
- uncertain or incomplete extracted information.

Needs attention
- material clause/financial consequence that the user should understand.

Urgent is reserved for true time-sensitive or immediate consequence, not routine contract review.

## Prototype acceptance criteria

Mobile:
- readable at 360px width;
- primary answer visible without excessive scrolling;
- no duplicate financial facts in the first two layers;
- important actions and consequences are obvious;
- no horizontal overflow.

Desktop:
- professional report feel at 1280–1440px;
- uses available width;
- navigation remains visible;
- central reading column is comfortable;
- evidence/context does not crowd the main explanation.

Content:
- clear distinction between fact, meaning and rule;
- no “AI says” language;
- no legal-advice posture;
- no invented calculations;
- tone is plain, professional and educational.

## Implementation boundary

Allowed:
- new design-system components;
- new prototype route;
- scoped styles/tokens required by the prototype;
- static representative data.

Not allowed in U03:
- replacement of the production /result route;
- backend contract changes;
- PolicyCheck activation;
- billing changes;
- global removal of all legacy components;
- destructive route migrations.

## Next gate

Once U03 is visually accepted, U04 builds the shared application shell and U05 migrates the real LeaseCheck result to the approved pattern.
