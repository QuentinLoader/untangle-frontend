# WorkCheck frontend checkpoint

The hidden authenticated `/prototype/workcheck-v2` now presents two selectable synthetic examples: an employment agreement and a disciplinary hearing notice. It is not linked from normal navigation. WorkCheck remains disabled for live customer analysis through the existing product gate.

The result uses the shared responsive ResultWorkspace, result sections, evidence disclosures and AddVision footer. Summary and important facts come first; expanded explanations separate what the document says, what that means and questions to clarify. Missing referenced policies and unknown outcomes remain explicit. The notice preserves the distinction between an allegation and a finding. Amounts and dates are fixed display strings; no take-home pay, legal outcome or referral deadline is calculated.

The presentation follows the approved U01 WorkCheck direction and the existing U05 WorkCheck production contract in the backend reference checkout. The fixture types are presentation data, not a new backend contract. Both examples provide source excerpts with document locations. No document processing, provider configuration, credentials, backend contracts, product activation or billing changed. PolicyCheck is unchanged.

Validation: frontend typecheck and production build passed; lint passed with seven existing React refresh warnings; 18 focused page tests passed. The browser checks covered both examples at 360px, source navigation and expansion, switching examples, and the three-column workspace at 1280px and 1440px without horizontal page overflow. Authentication is covered by the page tests and preview sign-in redirect. Local visual checks used a temporary component harness with compiled production styles; the harness was removed before committing.

This is a frontend review checkpoint, not production readiness for real employment documents. Remaining work includes additional employment document families, genuine redacted-document validation, approved time-sensitive legal references where applicable, and live result-contract wiring. OpenAI integration and live Ask/Q&A remain explicitly deferred.
