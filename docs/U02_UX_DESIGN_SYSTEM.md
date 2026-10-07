# U02 — Untangle South Africa UX Design System

Status: APPROVED FOR IMPLEMENTATION
Date: 2026-10-07

## Design objective

Make Untangle South Africa feel like a serious, modern consumer-information service: clear enough for a first-time younger user, credible enough for a high-stakes legal/tax/insurance decision.

The target is not a law-firm site, bank app, government portal or playful AI toy.

The product should feel:
- calm;
- competent;
- plain-language;
- trustworthy;
- modern;
- human;
- South African without relying on clichés.

## Core UX principles

1. Answer first; detail second.
2. One fact, one primary home.
3. Actions, money and dates outrank background explanation.
4. Explain consequences, not just wording.
5. Show evidence without forcing it into the first view.
6. Avoid card walls.
7. Use whitespace, dividers and hierarchy before adding boxes.
8. Preserve mobile clarity without crippling desktop.
9. Do not use “AI” as a visual gimmick or source of authority.
10. Professional does not mean cold or difficult.

## Typography

### Application UI
Use IBM Plex Sans as the default app typeface.

Use it for:
- navigation;
- result headings;
- labels;
- body copy;
- buttons;
- forms;
- tables;
- action panels.

Reason: it is clean, professional and highly readable on mobile.

### Editorial / learning / marketing
Use Fraunces sparingly for:
- portfolio landing hero;
- educational feature headlines;
- selected marketing statements.

Do not use Fraunces as the dominant typeface inside dense customer reports.

### Monospace
IBM Plex Mono is reserved for:
- reference numbers;
- document identifiers;
- dates where alignment matters;
- evidence/source labels;
- technical provenance.

Do not use monospace uppercase labels as the primary heading style throughout the application.

## Type scale

Mobile:
- page title: 26–30px / 1.15
- result headline: 24–28px / 1.2
- section heading: 18–20px / 1.3
- body: 15–16px / 1.55
- supporting body: 13.5–14.5px / 1.5
- metadata: 12–13px

Desktop:
- page title: 32–40px
- result headline: 30–36px
- section heading: 20–24px
- body: 15.5–17px

Never reduce important customer information to tiny text merely to fit a card.

## Colour system

Retain the existing forest/teal identity but make it more restrained.

Primary:
- deep forest/teal for primary actions, active navigation and trust accents;
- near-black green/charcoal for primary text;
- warm neutral background;
- white analysis surfaces.

Semantic:
- red only for critical/urgent consequence;
- amber for needs-attention / check-this;
- blue for neutral information;
- green for confirmed/complete/positive state.

Do not use several coloured tints in the same result merely to decorate sections.

## Surface hierarchy

Use three surface levels:

1. App background — soft neutral.
2. Main report surface — white or near-white.
3. Emphasis panel — subtle tinted or bordered area only where meaning requires emphasis.

Prefer:
- section dividers;
- spacing;
- headings;
- grouped facts.

Use rounded cards selectively for:
- key decision summary;
- warnings;
- action panels;
- Ask;
- discrete comparison/financial blocks.

Do not put every paragraph in its own rounded rectangle.

## Radius and borders

- controls: 10–12px;
- compact panels: 12px;
- major summary panels: 14–16px;
- avoid excessive pill shapes except status labels/chips;
- borders should be subtle and functional.

## Spacing

Use an 8px-based rhythm.

Typical:
- 4px micro gap;
- 8px compact;
- 12px row gap;
- 16px panel padding;
- 24px section gap;
- 32px major section gap;
- 48px page-section separation on desktop.

## Buttons

Primary:
- one clear primary action per screen/section;
- 48–52px minimum touch height;
- strong contrast;
- verb-led label.

Secondary:
- outline or text treatment;
- do not compete visually with the primary action.

Danger:
- visually distinct;
- require confirmation where destructive.

Avoid several full-width primary-looking buttons stacked together.

## Status language

Use plain labels:
- Needs attention
- Action needed
- Urgent
- Check this
- Confirmed
- Not confirmed
- Completed

Avoid stamp-like decorative urgency as the main status pattern.

## Data presentation

Money:
- right-align in detailed tables;
- use strong but not oversized emphasis in summary;
- always show currency;
- separate recurring payment, total commitment and end-of-term amount.

Dates:
- label what the date means;
- never show a date without context.

Responsibilities:
- use concise rows/bullets;
- separate “You” from “Other party”.

Evidence:
- source/page labels;
- expandable original wording;
- clear distinction between document evidence and external rule/guidance.

## Mobile layout

Default max content width: approximately 680px for reading screens.

Structure:
- compact top bar;
- page identity;
- 30-second answer;
- primary action/key money/date;
- section index or sticky section affordance where necessary;
- progressively disclosed detail;
- Ask;
- evidence.

Bottom navigation remains:
- Home
- Documents
- Reminders
- Account

Specialist products are not permanent tabs.

## Desktop/tablet layout

At wide widths, use an application workspace:

- left result navigation: 220–260px;
- central reading/report column: 620–760px;
- right context/evidence rail: 260–320px;
- overall max width: approximately 1240–1360px.

At medium widths:
- hide/collapse the right rail first;
- retain left navigation if usable;
- otherwise convert navigation to top tabs/section selector.

Do not constrain desktop reports to the current mobile-sized max-width container.

## Shared component direction

Create or refactor toward:
- AppShell
- PortfolioBrand
- ProductIdentity
- PageHeader
- ResultWorkspace
- ResultSidebar
- ResultContextRail
- ResultSummary
- KeyMetric
- ActionPanel
- SectionHeading
- FactList
- ResponsibilityList
- WarningPanel
- EvidenceDisclosure
- AskPanel
- EmptyState
- LoadingState

Existing BlockCard may remain for legacy screens until migration, but new U03 work should not build the new experience around generic BlockCard stacking.

## Content style

Preferred:
- “You will pay…”
- “Your agreement says…”
- “This means…”
- “Check this before you sign…”
- “SARS is asking you to…”

Avoid:
- “The aforementioned clause…”
- “AI has determined…”
- “According to our model…”
- dense legal qualifiers in the first view.

## Accessibility

- minimum 44px interactive target;
- visible keyboard focus;
- semantic headings;
- status is never colour-only;
- WCAG AA contrast target;
- no horizontal scrolling for normal mobile content;
- expandable disclosures must remain keyboard and screen-reader operable.

## Implementation approach

U02 should introduce new shared components and layout primitives without forcing an immediate rewrite of every legacy route.

Use U03 LeaseCheck V2 as the first real consumer of the new design system.

Legacy screens migrate in U04–U06.
