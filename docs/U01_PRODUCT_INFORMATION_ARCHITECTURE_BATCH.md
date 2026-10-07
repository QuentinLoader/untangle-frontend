# U01 — Untangle South Africa Product & Information Architecture

Status: APPROVED FOR DESIGN
Depends on: U00 security baseline
Scope: design/specification only; no full UI rebuild in this batch.

## Brand hierarchy

AddVision is the company and technology owner.

Untangle South Africa is the consumer document-understanding portfolio.

TaxSnap, LeaseCheck, PolicyCheck and WorkCheck are specialist products inside the Untangle South Africa portfolio.

Recommended hierarchy in customer-facing product screens:

- Product: LeaseCheck / TaxSnap / PolicyCheck / WorkCheck
- Portfolio: Part of Untangle South Africa
- Corporate trust: Untangle South Africa is an AddVision product

Do not make “AddVision LeaseCheck” the primary consumer product name.

## Shared platform versus specialist products

Shared platform responsibilities:
- authentication
- account/profile
- subscription and entitlements
- upload/storage/processing
- Documents/Vault/history
- reminders
- notifications
- privacy/security/support
- common evidence/provenance components
- common Ask shell where supported

Product-specific responsibilities:
- acquisition/landing journey
- upload guidance
- terminology
- result hierarchy
- money/date/action emphasis
- domain-specific explanations
- education and “why this matters”
- section navigation
- Ask starters/context
- evidence presentation where domain-specific

## Proposed route architecture

Public:
- /
- /taxsnap
- /leasecheck
- /policycheck
- /workcheck
- future educational content
- pricing
- sign-in / create-account

Authenticated shared application:
- /home
- /upload
- /documents
- /documents/:id
- /result/:id or equivalent product-aware result route
- /reminders
- /account
- /account/plan
- /account/security

Admin:
- /admin and explicitly authorized child routes

Existing routes must be migrated deliberately. Do not break old result links until redirects/backward compatibility are agreed.

## New Home purpose

Home should answer:
1. What needs my attention?
2. What have I recently checked?
3. What do I want to understand next?

It should not primarily be a list of four products.

Suggested mobile hierarchy:

Untangle South Africa
Plan / Account

Good morning, [name]

Needs your attention
[one important action/date]

Understand a document
[Upload / scan]

Your recent checks
[recent result]
[recent result]

Specialist tools
TaxSnap · LeaseCheck · PolicyCheck · WorkCheck

Learn before you commit/respond
[contextual education]

Bottom navigation:
Home · Documents · Reminders · Account

## Specialist acquisition journey

A campaign or search result may land directly on the specialist product.

Example:

LeaseCheck
Part of Untangle South Africa

Understand the agreement before you sign.

What LeaseCheck helps you understand:
- what you will pay
- what you are responsible for
- clauses that need attention
- what happens if things go wrong
- how the agreement can end

[Check my lease]

Untangle South Africa is an AddVision product

The customer should not have to understand the portfolio architecture before solving their problem.

## Result hierarchy — locked direction

Every specialist result should support four layers:

### 1. 30-second answer
Answer immediately:
- What is this?
- What matters most?
- Do I need to act?
- What money/date/deadline matters?
- What is the biggest risk or decision?

### 2. What this means for you
Explain practical consequences in plain language.
Teach unfamiliar concepts exactly where they matter.

### 3. Full report / evidence
Detailed facts, terms, responsibilities, calculations, legal/rule context, original wording, source page/evidence, confidence and warnings.

### 4. Ask
Grounded follow-up questions where the product supports Ask.
Ask must use the trusted document/rule context and must not silently override the validated result.

## Responsive behaviour

### Mobile
Priority:
1. headline/status
2. immediate action
3. key money/date
4. 30-second explanation
5. progressive disclosure
6. Ask
7. evidence

Avoid:
- long unbroken card stacks
- repeating the same amount/date in several places
- exposing every backend field
- dense side-by-side comparisons

### Desktop / tablet
Use a professional report workspace rather than stretched mobile.

Concept:

| Navigation | Main analysis | Context |
|---|---|---|
| Summary | 30-second answer | document identity |
| Money | what this means | confidence |
| Duties | detailed section | evidence/source |
| Risks | actions | Ask/context |
| Ending | supporting detail | |
| Evidence | | |
| Ask | | |

The context rail may collapse at intermediate widths.

## LeaseCheck V2 benchmark structure

LeaseCheck will be the first full UX prototype because it currently has the most demanding information set.

Recommended navigation:
- Summary
- Money
- Your responsibilities
- Other party’s responsibilities
- Important clauses
- Ending the agreement
- If things go wrong
- Legal protections
- Evidence
- Ask

Labels may adapt naturally for residential, commercial, vehicle and equipment agreements.

The Summary must not reproduce every section. It should surface only the facts that materially influence the user's decision.

## TaxSnap direction

TaxSnap should prioritize:
- what SARS sent
- how serious it is
- what SARS wants
- what the user should do next
- by when
- amount involved
- what happens if ignored
- where/how to respond
- evidence/source

TaxSnap should feel more action/deadline-oriented than LeaseCheck.

## PolicyCheck direction

Preserve P01-P04 reconstruction and purchased-cover distinction.

Future result should prioritize:
- reconstructed policy/set
- cover actually purchased
- key amounts/excesses/waiting periods
- major exclusions/conditions
- financial impact
- Heads up
- questions to ask insurer/broker
- evidence/history
- Ask after the base result is trustworthy

P05 UI implementation waits for the U03 design gate.

## WorkCheck direction

Prioritize:
- what document this is
- what it changes/requires
- money and working conditions
- important obligations
- deadlines/procedural issues
- what happens next
- CCMA/escalation context where safely applicable
- evidence
- Ask where supported

## Information-quality rules

1. Give each fact one primary home.
2. Do not repeat a fact because several backend structures contain it.
3. “What this means” must explain consequence, not repeat wording.
4. Separate document fact, rule/law, and customer meaning.
5. Show uncertainty where material information was not safely confirmed.
6. Actions, dates and money outrank background explanation.
7. Evidence is accessible without dominating the first view.
8. Original wording remains available for trust and verification.
9. Do not use “AI says” as authority.
10. Tone is professional, calm, approachable and clear.

## U01 deliverable

Create docs/U01_UNTANGLE_PRODUCT_INFORMATION_ARCHITECTURE.md containing:
- brand hierarchy
- public/app site map
- shared vs specialist boundary
- navigation
- mobile Home wireframe
- desktop workspace wireframe
- generic result hierarchy
- LeaseCheck wireframes
- TaxSnap / PolicyCheck / WorkCheck direction
- migration notes
- open decisions for U02/U03

## Approval gate before U02/U03

Explicitly approve:
1. portfolio/site map
2. mobile navigation
3. desktop workspace model
4. 30-second answer → meaning → full report hierarchy
5. LeaseCheck result section model
6. brand placement: Product → Untangle South Africa → AddVision
7. whether Ask is a persistent action or a dedicated section
8. whether evidence is a dedicated section or desktop drawer/side panel

No full frontend rebuild before this gate is approved.
