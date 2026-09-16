# LeaseCheck UX and copy simplification

## Goal
Make LeaseCheck results and follow-up answers practical and easy to scan on mobile, while preserving every backend value, warning, source, legal caveat, API call, feature flag, and unrelated product flow.

## Changes
- Refine LeaseCheck Overview copy and summary presentation so the document type, title, key term, payment, deposit, and action status are immediately clear when supplied by the backend.
- Replace the confidence warning explanation with the requested “Check these against the original” wording, list affected fields in plain English, and mark matching date/key-term rows with a small “Check this” badge without hiding values.
- Keep Key terms factual and concise across money, dates, other terms, responsibilities, and agreement wording.
- Restructure each Check item as “What to check”, “Why it matters”, and “What your lease says”; move legal bases out of the practical card body.
- Keep protections and recommended next steps prominent, but present concise practical text before legal material.
- Rename “More details” to a collapsed “Legal details” section containing legal explanations, caveats, Act/section references, disclaimer context, and sources at the bottom.
- Restructure Ask results into a short answer, document wording, a concise “What this means for you”, practical cautions, and collapsed Legal details.
- Safely remove visible Markdown artifacts and render basic structure without changing the backend’s conclusions or generating answers locally.
- Keep backend-provided suggested questions and the existing authenticated Ask request unchanged.

## Technical details
- Limit edits to LeaseCheck presentation helpers in `src/routes/result.tsx`, `src/components/untangle/LeaseAskSection.tsx`, and any narrowly required display-label helper in `src/lib/documents.ts`.
- Do not change API contracts, endpoint paths, result types, classification, legal selection, feature flags, routing, authentication, billing, reminders, Vault, TaxSnap, PolicyCheck, or WorkCheck.
- Use deterministic text cleanup and sectioning only: preserve all returned answer content, quotes, caveats, and sources; never infer a missing legal conclusion.

## Validation and release
- Run focused type/build checks and inspect current build diagnostics.
- Verify LeaseCheck Overview, Key terms, Check, and Ask at mobile width with no horizontal scrolling or raw Markdown.
- Exercise the existing production-backed Ask flow and confirm the grounded answer remains callable.
- Confirm TaxSnap is unchanged and PolicyCheck/WorkCheck remain unavailable.
- Publish to the existing Untangle production site, then re-check the live mobile LeaseCheck result and Ask experience.
