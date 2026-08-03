# Untangle — Design system, Home screen, Landing page

Nothing is built yet, so this plan covers both prompts: the shared design system + Home screen (prompt 1) and the marketing landing page (prompt 2).

## 1. Design tokens

Added to the global stylesheet as CSS variables and mapped to Tailwind utilities:

paper `#EEF1ED`, paper-2 `#E3E8E1`, ink `#1F2A24`, ink-soft `#5B6B66`, teal `#0F6E5C`, teal-dim `#D8E8E2`, stamp-red `#C1432D`, stamp-amber `#C98A2E`, card `#FFFFFF`, line `#D8DDD6`. Plus module blue `#3B5BA9` for the WorkCheck tag.

## 2. Typography

Google Fonts loaded via `<link>` in the root route head:
- Fraunces 600/700 — wordmark and headlines only
- IBM Plex Sans 400/500/600/700 — body
- IBM Plex Mono 500/600/700 — dates, data labels, uppercase tags, stamp badges

## 3. Reusable components (`src/components/untangle/`)

1. `StampBadge` — 2px border, mono bold uppercase, rotated -4deg, transparent bg. Props: `label`, `color` (red / teal / amber).
2. `DocCard` — white, 1px line border, 16px radius, 14px padding; 38x38 icon square (10px radius, colored bg), 14px bold title, 12px ink-soft subtitle, StampBadge below. Props: `icon`, `iconBg`, `title`, `subtitle`, `stampLabel`, `stampColor`.
3. `BottomTabBar` — fixed, 66px, white, 1px top line border; Home / Reminders / Vault / Profile emoji tabs; active tab teal.
4. `FAB` — teal pill, fixed bottom-right above tab bar, "＋ Upload", white text, teal shadow; navigates to `/upload`.
5. `PrimaryButton` / `SecondaryButton` — full-width, 14px radius, 14px padding. Primary teal fill/white text; Secondary transparent, ink text, 1.5px line border.
6. `BlockCard` — white, 1px line, 14px radius, 14px padding, with a mono uppercase 10.5px teal bold title slot and a content slot.

## 4. Home screen at `/`

Replaces the placeholder index route, matching the Screen 1 reference:
wordmark "Untangle" + "Morning, Thabo"; amber banner "⏰ 2 things due this week — tap to see"; section label "Your documents"; the three DocCards (SARS Letter of Demand / Greenfield Apartments Lease / Offer of Employment — Nandi Co.) with URGENT, REVIEWED and CHECK THIS stamps; FAB and BottomTabBar with Home active.

## 5. Landing page at `/landing`

Public marketing page reusing the tokens and components above, sections in order:

1. Nav — teal dot + "Untangle" left; TaxSnap / LeaseCheck / DealCheck / WorkCheck links centered (desktop only); "Try it free" primary button right.
2. Hero — two columns desktop, stacked mobile. Left: teal-dim mono pill "Built for South Africa", Fraunces headline (46px / 30px mobile) with the second line in teal, body paragraph, primary + secondary CTAs (stacked mobile, side by side desktop), trust line. Right: a result-style BlockCard with "TaxSnap" label, rotated red URGENT stamp, Fraunces headline "SARS wants R4,200 paid by 14 Jul", body copy, and a nested "What you need to do" BlockCard with two checkbox action rows.
3. Problem strip — full-width paper-2, centered Fraunces headline + paragraph.
4. Four modules — 4-col desktop / 2x2 mobile; white card, 1px border, 18px radius, 44px icon square, Fraunces name, description, colored mono tag (TaxSnap red, LeaseCheck teal, DealCheck amber, WorkCheck blue).
5. How it works — paper-2 background, 4 numbered teal-circle steps, 2-col grid mobile.
6. SEO teaser — heading + intro and 3 cards with module tag, Fraunces title, description; placeholder links.
7. Trust section — ink background, white text, Fraunces heading "Informational, not legal or tax advice" + 2 paragraphs, full section weight.
8. Final CTA — centered Fraunces heading, paragraph, primary button.
9. Footer — copyright left, Privacy / Disclaimer / Contact right; stacked and centered on mobile.

Mobile-only sticky bottom bar (under 720px): fixed, white, 1px top border, safe-area padding, full-width primary button "📷 Upload a document — free". Every upload CTA navigates to `/upload`.

Page metadata: distinct title, description, og/twitter tags for both `/` and `/landing`.

## Notes

- `/upload`, `/reminders`, `/vault`, `/profile` don't exist yet and will 404 until later prompts; the screen-2 upload reference is noted for that step.
- Tokens live in `src/styles.css` (Tailwind v4 `@theme`) rather than a separate `tokens.css`, so classes like `bg-paper` and `text-ink-soft` work; same variable names.
- Making `/landing` the true `/` is deferred to prompt 8, as you specified.
