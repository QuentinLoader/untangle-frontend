# Authenticated pages and PolicyCheck P09 checkpoint

Baseline: frontend main `4b5c779`, including the existing PolicyCheck synthetic prototype and U04–U06 page work.

## Customer-facing behaviour

- Home, all four specialist entry pages, upload, Documents, Reminders, processing and Account share the authenticated header/navigation and AddVision footer. Result workspaces retain their specialist report navigation and gain the same portfolio footer.
- Plan labels come from the backend entitlement response. Until that response arrives, the header says Account rather than incorrectly claiming Free.
- Home shows recent-document loading, empty and retry states, plus errors when reminders cannot be checked.
- Documents and Reminders wait for confirmed feature access before fetching. Existing Plus restrictions remain in place. Empty Documents links back to product selection; an empty search can clear its filters.
- Upload waits for account access and presents recoverable connection errors. A disabled or unknown product supplied directly in the URL cannot fall back to generic upload. Both file preparation and upload continuation enforce that state.
- Result entry/error screens preserve navigation and offer retry. Only TAX and LEASE responses enter their existing result renderers; other modules show an unavailable result instead of being treated as TaxSnap.
- The authentication wrapper mounts the protected component only after a session exists. Sign-in return links retain the complete result query, including document ID and origin.
- LeaseCheck now shows confirmed ordinary key terms and dates in the main report, including duration. It continues to display explicit backend financial values without recalculation.

## PolicyCheck P09

The hidden authenticated `/prototype/policycheck-v2` remains a synthetic result. Normal product navigation does not link to this prototype; PolicyCheck and WorkCheck remain unavailable for live customer analysis.

The PolicyCheck page includes the 30-second summary, a policy domain distinct from individual benefits, multi-document context and missing endorsement, purchased-versus-described-versus-unselected cover, money/excess uncertainty, waiting periods/exclusions, conditions, Heads up, the insurer's stated claim decision, contextual broker questions and expandable source evidence. Supporting evidence now covers the synthetic money and condition findings as well as the purchased-cover and claim findings.

Missing excess is explicitly unconfirmed and is never displayed as zero. No annual premium or other derived financial figure is calculated. A review deadline is not guessed. Claim allegations remain attributed to the insurer. Ask stays informational and has no live input or provider request. Detailed sections use native accessible disclosures; key cover distinctions and Heads up stay visible.

## Validation

- `bun run typecheck`: passed.
- `bun run lint`: passed, zero errors; seven existing non-blocking React Fast Refresh warnings.
- `bun run build`: production client/server build passed.
- `bun run test:pages`: 15 focused tests passed, including guard mounting, disabled upload URLs, account loading/error, Plus history gating, PolicyCheck distinctions, TaxSnap actions/dates, LeaseCheck explicit amounts/duration, retry and unsupported-module handling.
- Browser inspection used a local synthetic account/API, never customer documents. At 360px: Home, all four specialist entries, upload, Documents, Reminders, Account, processing, both existing result renderers and PolicyCheck were checked without horizontal page overflow.
- Desktop inspection checked the major entry/account pages at 1280px. PolicyCheck's three-column workspace was checked at 1280px and 1440px, with report widths of 637px and 692px respectively and no horizontal page overflow.
- Interactive checks covered upload retry recovery, history search/clear and result navigation, PolicyCheck disclosures/source expansion, unsupported results and a signed-out result returning through login with the original document ID and origin preserved.
- Generated route declarations were refreshed for the already-existing TaxSnap, LeaseCheck and PolicyCheck prototype routes. Pre-existing formatting errors in the public landing components and login were corrected to make full lint pass.

## Remaining release work

PolicyCheck is ready for frontend review with synthetic data. Genuine multi-document validation and live result-contract wiring remain required before release; the frontend does not implement policy reconstruction or determine purchased cover itself. WorkCheck retains its unavailable product page. Live upload/storage, billing transactions and real-document/provider processing were not exercised in this synthetic page QA.

OpenAI keys, credentials, configuration and production calls were intentionally deferred. No backend contract, billing contract or product activation was changed. Temporary seed/sign-out files used for local browser testing were removed before the production build and checkpoint.
