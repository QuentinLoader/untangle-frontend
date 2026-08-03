# Untangle

## PROMPT 1 of 8 — Design system + Home screen




**📎 Attach: screenshot of `screen-1-home.html`**




```

Build a mobile-first React app called Untangle. This prompt establishes

the design system — every later screen reuses these tokens and components

exactly, so get this right first.




DESIGN TOKENS — add these as CSS variables in a global tokens.css file:

  --paper: #EEF1ED

  --paper-2: #E3E8E1

  --ink: #1F2A24

  --ink-soft: #5B6B66

  --teal: #0F6E5C

  --teal-dim: #D8E8E2

  --stamp-red: #C1432D

  --stamp-amber: #C98A2E

  --card: #FFFFFF

  --line: #D8DDD6




TYPOGRAPHY — import from Google Fonts:

  - Fraunces (serif, weight 600 + 700) — headlines and wordmark only

  - IBM Plex Sans (400, 500, 600, 700) — all body text

  - IBM Plex Mono (500, 600, 700) — dates, data labels, uppercase tags, stamp badges




REUSABLE COMPONENTS to build now (used on every screen):

  1. StampBadge — inline badge with: 2px solid border in a passed color,

     IBM Plex Mono font, bold, uppercase, small letter-spacing, slightly

     rotated -4 degrees, transparent background. Props: label (string),

     color (string — one of stamp-red / teal / stamp-amber).

  2. DocCard — card with: white background, 1px var(--line) border, 16px

     border-radius, 14px padding, flex row with an icon square (38x38px,

     10px radius, colored background), a title (bold, 14px), a subtitle

     (ink-soft, 12px), and a StampBadge below the subtitle. Props: icon,

     iconBg, title, subtitle, stampLabel, stampColor.

  3. BottomTabBar — fixed bottom bar (66px tall, white background, 1px

     top border in var(--line)), 4 tabs: Home / Reminders / Vault /

     Profile with small emoji icons. Active tab uses var(--teal).

  4. FAB (Floating Action Button) — teal pill button, fixed bottom-right

     above the tab bar, label "＋ Upload", white text, teal drop shadow.

  5. PrimaryButton + SecondaryButton — full-width, 14px border-radius,

     14px padding. Primary: teal fill, white text. Secondary: transparent,

     ink text, 1.5px var(--line) border.

  6. BlockCard — white card with 1px line border, 14px radius, 14px

     padding. Has a block title slot (IBM Plex Mono, uppercase, 10.5px,

     teal, bold) and a content slot.




BUILD: Home screen at route "/"

Layout exactly as the attached screenshot:

  - Top: wordmark "Untangle" (Fraunces 600, 21px) + greeting "Morning,

    Thabo" below it in ink-soft 13px

  - An amber banner strip (var(--stamp-amber) background, white text,

    14px border-radius): "⏰ 2 things due this week — tap to see"

  - Section label "Your documents" (IBM Plex Mono, uppercase, 11px,

    ink-soft)

  - 3 DocCard components:

    1. icon 📨, iconBg #FBEAE5, title "SARS Letter of Demand",

       subtitle "R4,200 due 14 Jul", stamp "URGENT" red

    2. icon 🏠, iconBg var(--teal-dim), title "Greenfield Apartments

       Lease", subtitle "2 clauses worth knowing about", stamp "REVIEWED"

       teal

    3. icon 💼, iconBg #F3EBDC, title "Offer of Employment — Nandi Co.",

       subtitle "Probation clause flagged", stamp "CHECK THIS" amber

  - FAB component (navigates to "/upload" when tapped)

  - BottomTabBar with Home tab active

```




---

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6b936d46-6ae2-42e2-9c20-909a8b46df3c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
