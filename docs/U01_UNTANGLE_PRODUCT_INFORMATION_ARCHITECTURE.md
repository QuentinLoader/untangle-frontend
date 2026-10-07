# U01 — Untangle South Africa Product and Information Architecture

Status: APPROVED DIRECTION
Date: 2026-10-07

## Brand hierarchy

AddVision
└── Untangle South Africa
    ├── TaxSnap
    ├── LeaseCheck
    ├── PolicyCheck
    └── WorkCheck

AddVision is the company and technology owner.

Untangle South Africa is the consumer document-understanding portfolio.

TaxSnap, LeaseCheck, PolicyCheck and WorkCheck are specialist products with their own customer journeys and result experiences.

Recommended customer-facing hierarchy:
- primary: product name;
- secondary: Part of Untangle South Africa;
- trust/footer: Untangle South Africa is an AddVision product.

## Product architecture

Untangle South Africa remains one shared platform for:
- authentication;
- account/profile;
- plan and billing;
- upload/storage/processing;
- Documents/Vault;
- reminders;
- history;
- support/security/privacy;
- common evidence and Ask infrastructure.

Each specialist product owns:
- its landing proposition;
- upload guidance;
- terminology;
- result hierarchy;
- educational explanations;
- domain-specific actions, money, dates and risks;
- specialist Ask starters and contextual help.

The backend analysis engines remain shared and are not rebuilt as part of this UX reset.

## Customer-entry model

A user may enter Untangle South Africa in two ways.

### Portfolio entry
The user visits the Untangle South Africa home page and chooses what they want to understand.

### Problem-specific entry
A social, search or campaign link lands directly on a specialist product.

Examples:
- /taxsnap
- /leasecheck
- /policycheck
- /workcheck

A customer should not need to understand the portfolio structure before solving the immediate problem.

## New application navigation

Recommended primary app navigation:

- Home
- Documents
- Reminders
- Account

Specialist products are entry points and analysis experiences rather than permanent bottom-navigation items.

### Home purpose

Home answers:
1. What needs my attention?
2. What have I recently checked?
3. What do I want to understand next?

Suggested mobile structure:

Untangle South Africa

Good morning, [name]

[Needs your attention]

[Understand a document]

Recent checks
- item
- item

Specialist tools
TaxSnap
LeaseCheck
PolicyCheck
WorkCheck

Learn before you commit or respond
[contextual guidance]

Home · Documents · Reminders · Account

## Result architecture

Every specialist product follows one information principle while keeping its own result design.

### Layer 1 — 30-second answer

Answer immediately:
- What is this?
- What matters most?
- Do I need to act?
- What money, date or deadline matters?
- What is the biggest risk or decision?

### Layer 2 — What this means for you

Explain consequence rather than repeat document wording.

This is also the primary education layer.

Examples:
- what a balloon payment means;
- what a notice period actually changes;
- why an exclusion matters;
- what happens if a SARS deadline is missed.

### Layer 3 — Full report and evidence

Provide the detailed result:
- facts;
- terms;
- responsibilities;
- calculations;
- rights/rules/guidance;
- original wording;
- source page/evidence;
- uncertainty warnings.

### Ask

Ask is grounded in the validated result, document and approved rules.

Ask may explain or clarify but must not silently replace validated facts or create unsupported legal/financial conclusions.

## Information rules

1. Give each material fact one primary home.
2. Do not repeat a value merely because it exists in several backend structures.
3. Actions, money and dates outrank background explanation.
4. Separate document fact, rule/guidance and customer meaning.
5. Make uncertainty visible.
6. Keep evidence available without forcing it into the first screen.
7. Never present “AI says” as the authority.
8. Use progressive disclosure rather than long card stacks.
9. The first view should help the user decide what to do, not prove how much analysis occurred.
10. Maintain a professional, calm and approachable tone.

## Responsive design

Mobile-first remains a core requirement because the primary audience is younger South Africans.

Mobile-first does not mean mobile-only.

### Mobile

Priority:
1. result headline/status;
2. immediate action;
3. key money/date;
4. 30-second answer;
5. progressively disclosed sections;
6. Ask;
7. evidence.

Avoid:
- dense card walls;
- repeated summaries;
- tiny tables;
- showing every extracted field;
- desktop content simply squeezed into a phone.

### Desktop and tablet

Use a professional report workspace.

Concept:

| Result navigation | Main analysis | Context |
|---|---|---|
| Summary | 30-second answer | document identity |
| Money | what this means | confidence/warnings |
| Duties | detailed section | evidence/source |
| Risks | actions and consequences | Ask/context |
| Ending | supporting detail | |
| Evidence | | |
| Ask | | |

The right context rail collapses as available width reduces.

## LeaseCheck V2 — design benchmark

LeaseCheck becomes the first specialist UX prototype because it has the most demanding information set.

Recommended section model:
- Summary
- Money
- Your responsibilities
- Other party responsibilities
- Important clauses
- Ending the agreement
- If things go wrong
- Legal protections
- Evidence
- Ask

Labels must adapt naturally by family:
- residential property;
- commercial property;
- vehicle;
- equipment/hire.

### LeaseCheck summary rule

The Summary is not a condensed copy of every section.

It should surface the few facts that drive the user's decision.

Example vehicle agreement:

LeaseCheck
Vehicle finance agreement

30-second answer

Monthly payment
R...

Term
...

Final balloon
R...

Total repayable
R...

Three things to understand before signing
1. ...
2. ...
3. ...

[See what this means for you]

## TaxSnap direction

TaxSnap should be action/deadline oriented.

Priority:
- what SARS sent;
- how serious it is;
- what SARS wants;
- what the user should do next;
- deadline;
- money involved;
- what happens if ignored;
- where/how to respond;
- evidence.

## PolicyCheck direction

Preserve the existing reconstruction engine and purchased-cover distinction.

Future customer result prioritizes:
- policy/set reconstructed;
- cover actually purchased;
- key amounts/excesses/waiting periods;
- material exclusions and conditions;
- financial impact;
- Heads up;
- questions for insurer/broker;
- evidence/history;
- Ask once the base result is trusted.

PolicyCheck P05 frontend/result implementation waits for the new specialist-result design pattern.

## WorkCheck direction

Priority:
- what the document is;
- what changes or is required;
- pay/working conditions;
- important obligations;
- process/deadline issues;
- what happens next;
- escalation context where safely applicable;
- evidence;
- Ask where supported.

## Route migration direction

Target public routes:
- /
- /taxsnap
- /leasecheck
- /policycheck
- /workcheck

Target authenticated routes:
- /home
- /upload
- /documents
- /documents/:id
- /result/:id or a product-aware equivalent
- /reminders
- /account
- /account/plan
- /account/security

Target administrator route:
- /admin

Current routes remain until the replacement shell is ready. Existing result/deep links must not be broken without redirects or compatibility handling.

## UX gate

The next design work must use this architecture.

U02 defines the shared professional design system.

U03 produces the complete responsive LeaseCheck V2 prototype before the broader frontend rebuild proceeds.
