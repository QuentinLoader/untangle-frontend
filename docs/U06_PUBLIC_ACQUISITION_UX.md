# U06 — Public Acquisition and Marketing UX

Status: IMPLEMENTED FOR REVIEW  
Date: 2026-10-07

## Purpose

Add the missing public acquisition layer between social/search traffic and the authenticated Untangle South Africa application.

The intended customer journey is now:

Social / search / direct link
→ public specialist marketing page
→ create account or sign in
→ authenticated specialist entry
→ upload
→ processing
→ result

## Public portfolio

The signed-out portfolio homepage at `/` no longer uses the forest/mountain hero.

It now:
- explains the Untangle South Africa proposition directly;
- presents TaxSnap and LeaseCheck as available specialist tools;
- shows PolicyCheck and WorkCheck as coming soon;
- explains the three-depth result model at a high level;
- states the current Free allowance and Untangle Plus monthly price;
- gives one clear account-creation action.

Signed-in visitors continue to route to `/home` without seeing the public marketing page.

## Public specialist routes

### /taxsnap

Public, social/search-friendly TaxSnap acquisition page.

Primary message:
**Got something from SARS and not sure what it means?**

Explains:
- what SARS is asking;
- dates and money that matter;
- what happens next;
- a simple before/after example;
- privacy/account boundary;
- free account entry point.

### /leasecheck

Public, social/search-friendly LeaseCheck acquisition page.

Primary message:
**Know what you are committing to before you sign.**

Explains:
- financial commitment;
- responsibilities;
- important clauses and consequences;
- a simple agreement example;
- privacy/account boundary;
- free account entry point.

## Account hand-off

Signed-out specialist CTAs go to account creation with the intended authenticated specialist route preserved:

- TaxSnap → create account → `/solutions/taxsnap`
- LeaseCheck → create account → `/solutions/leasecheck`

Sign-in / create-account cross-links now preserve the same redirect where available.

Signed-in visitors to the public specialist pages see an **Open TaxSnap** or **Open LeaseCheck** action instead.

## Brand hierarchy

Public pages follow:

Product
→ Part of Untangle South Africa
→ Untangle South Africa is an AddVision product

AddVision remains the corporate/trust layer, not the primary consumer product.

## UX rules

- Marketing explains enough value before asking for account creation.
- Public pages are problem-led, not feature catalogues.
- No forest/decorative hero imagery is required to communicate the value.
- Specialist pages remain visually related but clearly identify TaxSnap vs LeaseCheck.
- The app itself remains lighter than the marketing pages.
- Detailed product education stays in the appropriate specialist/result context.

## Unchanged

- backend APIs;
- Supabase authentication behavior;
- session persistence;
- billing logic;
- current R79/month Plus offer;
- Free allowance logic;
- TaxSnap/LeaseCheck result contracts;
- PolicyCheck activation;
- WorkCheck implementation.
