# Untangle — Design system + Home screen

Mobile-first React app. This first step locks in the visual language (colors, fonts, shared components) so every later screen reuses it unchanged.

## Design tokens

Added to the global stylesheet as CSS variables and mapped to Tailwind utilities:

paper `#EEF1ED`, paper-2 `#E3E8E1`, ink `#1F2A24`, ink-soft `#5B6B66`, teal `#0F6E5C`, teal-dim `#D8E8E2`, stamp-red `#C1432D`, stamp-amber `#C98A2E`, card `#FFFFFF`, line `#D8DDD6`.

## Typography

Google Fonts loaded via `<link>` in the root route head:
- Fraunces 600/700 — wordmark and headlines only
- IBM Plex Sans 400/500/600/700 — body
- IBM Plex Mono 500/600/700 — dates, data labels, uppercase tags, stamp badges

## Reusable components

Created under `src/components/untangle/`:

1. `StampBadge` — 2px border, mono bold uppercase, rotated -4deg, transparent bg. Props: `label`, `color` ("red" | "teal" | "amber").
2. `DocCard` — white card, 1px line border, 16px radius, 14px padding; 38x38 icon square (10px radius, colored bg), 14px bold title, 12px ink-soft subtitle, StampBadge below. Props: `icon`, `iconBg`, `title`, `subtitle`, `stampLabel`, `stampColor`.
3. `BottomTabBar` — fixed, 66px, white, 1px top line border; Home / Reminders / Vault / Profile with emoji icons; active tab teal. Links to `/`, `/reminders`, `/vault`, `/profile`.
4. `FAB` — teal pill, fixed bottom-right above tab bar, "＋ Upload", white text, teal drop shadow; navigates to `/upload`.
5. `PrimaryButton` / `SecondaryButton` — full-width, 14px radius, 14px padding. Primary teal fill/white text; Secondary transparent with ink text and 1.5px line border.
6. `BlockCard` — white card, 1px line, 14px radius, 14px padding, with a mono uppercase 10.5px teal bold title slot plus content slot.

## Home screen at `/`

Replaces the placeholder index route. Paper background, content padded, bottom padding to clear tab bar + FAB:
- Wordmark "Untangle" (Fraunces 600, 21px) with "Morning, Thabo" (ink-soft, 13px)
- Amber banner strip: "⏰ 2 things due this week — tap to see"
- Section label "Your documents" (mono, uppercase, 11px, ink-soft)
- Three DocCards exactly as specified (SARS Letter of Demand / Greenfield Apartments Lease / Offer of Employment — Nandi Co.)
- FAB + BottomTabBar with Home active

Page metadata: title and description specific to Untangle, plus og/twitter tags.

## Notes

- Tab and FAB destinations (`/upload`, `/reminders`, `/vault`, `/profile`) do not exist yet; they will render the 404 page until later prompts add them. Say the word if you'd prefer stub pages now instead.
- Tokens live in `src/styles.css` (Tailwind v4 `@theme`), not a separate `tokens.css`, so Tailwind classes like `bg-paper` and `text-ink-soft` work; same variable names.
