# U05 — Upload and Processing UX

Status: IMPLEMENTED
Date: 2026-10-07

## Goal

Make upload and analysis feel like a deliberate continuation of the approved Untangle South Africa specialist journeys rather than a generic file-picker/process spinner.

## Upload

The shared `/upload` route now adapts to the selected specialist product.

### TaxSnap
- product identity remains visible;
- the page asks for the original SARS document;
- copy explains that TaxSnap identifies the supported document type before explaining it.

### LeaseCheck
- product identity remains visible;
- the page asks for the agreement or lease-related notice;
- copy explains that LeaseCheck identifies the document role before explaining terms and consequences.

### Generic Home upload
- remains supported;
- tells the user that classification is not required up front;
- offers operational specialist entry points without creating a wizard.

## Upload interaction

Existing behaviour is preserved:
- same document-record creation contract;
- same supported MIME validation;
- same 25 MB limit;
- same signed direct-to-storage upload;
- same backend verification;
- same usage/entitlement checks;
- same retry behaviour.

Presentation changes:
- one dominant document action;
- clearer selected-file state;
- broader desktop layout;
- security/privacy context rail;
- plain-language “what happens next” explanation;
- reduced card stacking.

## Processing

`/processing/$documentId` now accepts an optional specialist `solution` search value passed from upload.

The backend remains the source of truth. Once a detected module is returned, detected product identity overrides the requested entry context.

### TaxSnap processing language
Focuses on:
- identifying the SARS document;
- reading dates, amounts and requests;
- validating important details;
- checking what the notice requires.

### LeaseCheck processing language
Focuses on:
- identifying the agreement/document role;
- reading money, dates and responsibilities;
- validating important terms;
- checking applicable protections.

### Generic processing
Uses a neutral Untangle South Africa sequence until a supported module is detected.

## Safety and trust

- no measured percentage is shown because the backend does not provide measured progress;
- no backend jargon is exposed;
- no AI/provider language is used as authority;
- needs-review states remain fail-closed;
- document/result ownership and API security remain unchanged;
- the user is told that important details are checked before a result is shown.

## Responsive behaviour

Mobile:
- single-column upload and processing flow;
- minimum touch targets maintained;
- no horizontal dependency.

Desktop:
- wider reading/upload area;
- separate contextual trust panel;
- no forced mobile-width column.

## Unchanged

- approved Home UX;
- TaxSnap result contract/presentation;
- LeaseCheck result contract/presentation;
- backend APIs;
- billing;
- Supabase auth;
- PolicyCheck activation;
- WorkCheck.
