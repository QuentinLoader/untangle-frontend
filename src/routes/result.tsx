import type { ReactNode } from "react";
import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { StampBadge, type StampColor } from "@/components/untangle/StampBadge";
import { BlockCard } from "@/components/untangle/BlockCard";
import {
  formatResultAmount,
  formatResultDate,
  friendlyDocumentError,
  getDocumentResult,
  severityLabel,
  type DocumentResult,
  type LeaseDocumentResult,
  type TaxDocumentResult,
  type ResultSeverity,
} from "@/lib/documents";
import { parseResultOrigin, resultBackTarget, type ResultOrigin } from "@/lib/navigation";

type ResultSearch = { documentId: string; from: ResultOrigin };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/result")({
  validateSearch: (search: Record<string, unknown>): ResultSearch => {
    const value = typeof search["documentId"] === "string" ? search["documentId"] : "";
    return {
      documentId: UUID_RE.test(value) ? value : "",
      from: parseResultOrigin(search["from"]),
    };
  },
  head: () => ({
    meta: [
      { title: "Document result — Untangle" },
      {
        name: "description",
        content: "A plain-English answer that tells you what the document means and what to do next.",
      },
      { property: "og:title", content: "Document result — Untangle" },
      {
        property: "og:description",
        content: "A plain-English answer that tells you what the document means and what to do next.",
      },
    ],
  }),
  component: withAuth(Result),
});

const SEVERITY_COLOR: Record<ResultSeverity, StampColor> = {
  INFO: "teal",
  ACTION_NEEDED: "amber",
  URGENT: "red",
  CRITICAL: "red",
};

const MATERIAL_WARNING_FIELDS = new Set([
  "RESPONSE_DUE_DATE",
  "SUBMISSION_DUE_DATE",
  "PAYMENT_DUE_DATE",
  "APPEAL_DUE_DATE",
  "OBJECTION_DUE_DATE",
  "CORRECTION_DUE_DATE",
  "APPEAL_PERIOD",
  "RESPONSE_PERIOD",
  "AMOUNT_DUE",
  "ASSESSED_AMOUNT",
  "REFUND_AMOUNT",
  "ACCOUNT_BALANCE",
  "TAXPAYER_REFERENCE_NUMBER",
  "CASE_NUMBER",
  "REQUESTED_ACTION",
  "REQUESTED_DOCUMENTS",
]);

function Result() {
  const { documentId, from } = Route.useSearch();
  const back = resultBackTarget(from);

  const { data, isPending, error } = useQuery({
    queryKey: ["document-result", documentId],
    queryFn: () => getDocumentResult(documentId),
    enabled: documentId !== "",
    retry: false,
  });

  const result = data?.data.result;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <Link
            to={back.to}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors active:bg-paper-2"
            aria-label={`Back to ${back.label}`}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-teal">
              Result
            </p>
            <h1 className="truncate font-display text-[17px] font-semibold text-ink">
              {result?.document.moduleDisplayName ?? "Result"}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
        {documentId === "" ? (
          <StateMessage
            title="We could not find this result"
            body="Open the document again from your Vault to view its result."
          />
        ) : isPending ? (
          <StateMessage title="Loading your result…" body="One moment while we fetch it." />
        ) : error || !result ? (
          <StateMessage
            title="This result could not be loaded"
            body={friendlyDocumentError(error)}
          />
        ) : (
          <ResultBody result={result} />
        )}
      </main>
    </div>
  );
}

function StateMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
      <h2 className="font-display text-[20px] font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-[290px] text-[13px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.09em] text-teal">
      {children}
    </p>
  );
}

function friendlyTaxArea(result: TaxDocumentResult): string {
  const { taxType, taxonomyDocumentType, taxpayerType } = result.document;

  if (taxonomyDocumentType === "sars_cit_verification_final_request" ||
      taxonomyDocumentType === "sars_company_assessment_itr14") {
    return "Company Income Tax (CIT)";
  }

  switch (taxType) {
    case "income_tax":
      return taxpayerType === "company" ? "Company Income Tax (CIT)" : "Income tax";
    case "vat":
      return "VAT";
    case "paye":
      return "PAYE";
    case "provisional_tax":
      return "Provisional tax";
    case "customs_excise":
      return "Customs & Excise";
    default:
      return "Other / not confirmed";
  }
}

const WARNING_LABELS: Record<string, string> = {
  RESPONSE_DUE_DATE: "response deadline",
  SUBMISSION_DUE_DATE: "submission deadline",
  PAYMENT_DUE_DATE: "payment deadline",
  APPEAL_DUE_DATE: "appeal deadline",
  OBJECTION_DUE_DATE: "objection deadline",
  CORRECTION_DUE_DATE: "correction deadline",
  APPEAL_PERIOD: "appeal period",
  RESPONSE_PERIOD: "response period",
  AMOUNT_DUE: "amount due",
  ASSESSED_AMOUNT: "assessed amount",
  REFUND_AMOUNT: "refund amount",
  ACCOUNT_BALANCE: "account balance",
  TAXPAYER_REFERENCE_NUMBER: "taxpayer reference number",
  CASE_NUMBER: "SARS case number",
  REQUESTED_ACTION: "requested action",
  REQUESTED_DOCUMENTS: "requested documents",
};

function warningCopy(fieldKeys: string[]): string {
  const labels = [...new Set(fieldKeys.map((key) => WARNING_LABELS[key] ?? key.replaceAll("_", " ").toLowerCase()))];
  if (labels.length === 1) {
    return `Untangle could not confidently confirm the ${labels[0]}. Compare it with the original document before relying on it.`;
  }
  if (labels.length > 1) {
    return `Untangle could not confidently confirm: ${labels.slice(0, 3).join(", ")}. Compare these details with the original document before relying on them.`;
  }
  return "Some important wording was not clear enough to confirm automatically. Compare the action and dates with the original document.";
}

function sameMeaning(left: string, right: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return normalize(left) === normalize(right);
}

function isLeaseResult(result: DocumentResult): result is LeaseDocumentResult {
  return result.document.module === "LEASE";
}

function ResultBody({ result }: { result: DocumentResult }) {
  if (isLeaseResult(result)) {
    return <LeaseResultBody result={result} />;
  }

  return <TaxResultBody result={result} />;
}

function ClauseSeverity({ severity }: { severity: "LOW" | "MEDIUM" | "HIGH" }) {
  const label = severity === "HIGH" ? "Needs attention" : severity === "MEDIUM" ? "Check this" : "Note";
  return (
    <span className="rounded-full border border-line bg-paper px-2 py-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.06em] text-ink-soft">
      {label}
    </span>
  );
}

const LEASE_WARNING_LABELS: Record<string, string> = {
  PROPERTY_ADDRESS: "property address",
  RENT_AMOUNT: "rent amount",
  DEPOSIT_AMOUNT: "deposit amount",
  LEASE_START_DATE: "lease start date",
  LEASE_END_DATE: "lease end date",
  START_DATE: "start date",
  END_DATE: "end date",
  NOTICE_PERIOD: "notice period",
  RENT_ESCALATION: "rent escalation",
  ESCALATION_CLAUSE: "rent escalation clause",
  MAINTENANCE_RESPONSIBILITY: "maintenance responsibility",
  MAINTENANCE_CLAUSE: "maintenance clause",
  LANDLORD_ACCESS: "landlord access term",
  ACCESS_CLAUSE: "access clause",
  EARLY_TERMINATION: "early termination term",
  TERMINATION_CLAUSE: "termination clause",
  OCCUPATION_DATE: "occupation date",
};

function leaseWarningFieldLabel(fieldKey: string): string {
  return fieldKey
    .split("/")
    .map((part) => {
      const key = part.trim().toUpperCase();
      return LEASE_WARNING_LABELS[key] ?? key.replaceAll("_", " ").toLowerCase();
    })
    .join(" and ");
}

function leaseWarningCopy(
  warning: NonNullable<LeaseDocumentResult["validationWarnings"]>[number],
): string {
  const label = leaseWarningFieldLabel(warning.fieldKey);

  switch (warning.code) {
    case "LOW_CONFIDENCE_IMPORTANT_TERM":
      return `LeaseCheck could not confidently confirm the ${label}.`;
    case "IMPORTANT_TERM_MISSING_SOURCE_ANCHOR":
      return `LeaseCheck found the ${label}, but could not retain the exact source wording for it.`;
    case "IMPOSSIBLE_DATE_ORDER":
      return `The ${label} appear to be in an impossible order. LeaseCheck has kept the extracted dates unchanged.`;
    default:
      return warning.message || `Check the ${label} against the original lease before relying on it.`;
  }
}

function LeaseResultBody({ result }: { result: LeaseDocumentResult }) {
  const { summary, document, humanGuide, yourRights } = result;
  const validationWarnings = result.validationWarnings ?? [];
  const hasResponsibilities =
    humanGuide.tenantResponsibilities.length > 0 || humanGuide.landlordResponsibilities.length > 0;

  return (
    <div className="space-y-3">
      <section className="rounded-[18px] border border-line bg-white p-4 shadow-[0_1px_0_rgba(31,42,36,0.03)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel>What this is</SectionLabel>
            <h2 className="mt-2 font-display text-[23px] font-semibold leading-[1.15] text-ink">
              {humanGuide.whatThisIs || summary.headline}
            </h2>
          </div>
          <StampBadge
            label={severityLabel(summary.severity)}
            color={SEVERITY_COLOR[summary.severity]}
            className="mt-1 shrink-0 rotate-[-4deg]"
          />
        </div>
        <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.6] text-ink-soft">
          {summary.plainEnglish}
        </p>
        {validationWarnings.length === 0 &&
        (document.confidence === "MEDIUM" || document.confidence === "LOW") ? (
          <div className="mt-3 rounded-[12px] bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-ink">
            Compare important money, dates and notice wording with the original lease before relying on it.
          </div>
        ) : null}
      </section>

      {validationWarnings.length > 0 ? (
        <div
          className="rounded-[16px] border border-stamp-amber/35 bg-tint-sand p-4"
          role="alert"
        >
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-stamp-amber"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">
                Check against the original
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                Some important lease terms need you to compare them with the original before relying on them. LeaseCheck has not changed the extracted facts.
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {validationWarnings.map((warning, index) => (
                  <li
                    key={`${warning.code}-${warning.fieldKey}-${index}`}
                    className="flex gap-2 text-[11.5px] leading-relaxed text-ink"
                  >
                    <span className="text-stamp-amber" aria-hidden="true">•</span>
                    <span>{leaseWarningCopy(warning)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
      <BlockCard title="What you are agreeing to" className="!rounded-[18px] !p-4">
        <p className="text-[13px] leading-relaxed text-ink">{humanGuide.whatYouAreAgreeingTo}</p>
      </BlockCard>

      {humanGuide.importantMoney.length > 0 ? (
        <BlockCard title="Important money" className="!rounded-[18px] !p-4">
          <div className="space-y-2.5">
            {humanGuide.importantMoney.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-[12px] bg-paper px-3 py-2.5">
                <span className="text-[12px] text-ink-soft">{item.label}</span>
                <span className="text-right text-[13px] font-semibold text-ink">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-soft">These figures come from the lease wording; LeaseCheck does not fill in missing amounts.</p>
        </BlockCard>
      ) : null}

      {humanGuide.importantDates.length > 0 ? (
        <BlockCard title="Important dates" className="!rounded-[18px] !p-4">
          <div className="space-y-2.5">
            {humanGuide.importantDates.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-[12px] bg-paper px-3 py-2.5">
                <span className="text-[12px] text-ink-soft">{item.label}</span>
                <span className="text-right text-[13px] font-semibold text-ink">{item.value}</span>
              </div>
            ))}
          </div>
        </BlockCard>
      ) : null}

      {hasResponsibilities ? (
        <BlockCard title="Responsibilities in this lease" className="!rounded-[18px] !p-4">
          {humanGuide.tenantResponsibilities.length > 0 ? (
            <div>
              <p className="text-[12px] font-semibold text-ink">Tenant</p>
              <ul className="mt-2 space-y-2">
                {humanGuide.tenantResponsibilities.map((item) => (
                  <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {humanGuide.landlordResponsibilities.length > 0 ? (
            <div className={humanGuide.tenantResponsibilities.length > 0 ? "mt-4 border-t border-line pt-4" : ""}>
              <p className="text-[12px] font-semibold text-ink">Landlord</p>
              <ul className="mt-2 space-y-2">
                {humanGuide.landlordResponsibilities.map((item) => (
                  <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-soft">LeaseCheck only assigns a responsibility when the accepted lease wording does.</p>
        </BlockCard>
      ) : null}

      {humanGuide.clausesToCheck.length > 0 ? (
        <BlockCard title="Clauses to pay attention to" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {humanGuide.clausesToCheck.map((flag) => (
              <div key={flag.id} className="rounded-[14px] border border-line bg-paper px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold leading-snug text-ink">{flag.title}</p>
                  <ClauseSeverity severity={flag.severity} />
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{flag.explanation}</p>
                {flag.leaseText ? (
                  <div className="mt-2 rounded-[10px] bg-white px-3 py-2 text-[11px] leading-relaxed text-ink">
                    <span className="font-semibold">Your lease says: </span>{flag.leaseText}
                  </div>
                ) : null}
                {flag.legalBasis ? (
                  <p className="mt-2 text-[10.5px] leading-relaxed text-ink-soft">General legal context: {flag.legalBasis}</p>
                ) : null}
              </div>
            ))}
          </div>
        </BlockCard>
      ) : null}

      {humanGuide.nextSteps.length > 0 ? (
        <BlockCard title="Do this next" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {humanGuide.nextSteps.map((step, index) => (
              <div key={step.id} className="flex gap-3 rounded-[14px] bg-paper px-3 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-[12px] font-bold text-white">{index + 1}</div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[13.5px] font-semibold leading-snug text-ink">{step.title}</p>
                  {step.detail ? <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{step.detail}</p> : null}
                  <p className="mt-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.06em] text-teal">
                    {step.sourceKind === "LEASE" ? "Your lease says" : step.sourceKind === "LAW_GENERAL" ? "General legal guidance" : "Untangle explanation"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BlockCard>
      ) : null}

      {yourRights.length > 0 ? (
        <BlockCard title="General protections that may matter" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {yourRights.map((right) => (
              <div key={right.id} className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-semibold text-ink">{right.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{right.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </BlockCard>
      ) : null}

      {humanGuide.whereToGetHelp ? (
        <BlockCard title="Where to get help" className="!rounded-[18px] !p-4">
          <p className="text-[13px] leading-relaxed text-ink">{humanGuide.whereToGetHelp}</p>
        </BlockCard>
      ) : null}

      {(humanGuide.legalNotes.length > 0 || humanGuide.guidanceSources.length > 0) ? (
        <details className="rounded-[18px] border border-line bg-white p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-semibold text-ink">
            More details
            <ChevronDown className="h-4 w-4 text-ink-soft" aria-hidden="true" />
          </summary>
          {humanGuide.legalNotes.length > 0 ? (
            <div className="mt-3 space-y-2">
              {humanGuide.legalNotes.map((note) => <p key={note} className="text-[11.5px] leading-relaxed text-ink-soft">{note}</p>)}
            </div>
          ) : null}
          {humanGuide.guidanceSources.length > 0 ? (
            <div className="mt-4 border-t border-line pt-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-teal">Sources checked</p>
              <div className="mt-2 space-y-2">
                {humanGuide.guidanceSources.map((source) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="block text-[11.5px] font-medium leading-relaxed text-teal underline-offset-2 hover:underline">
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </details>
      ) : null}

      <div className="mt-5 border-t border-dashed border-line pt-4 pb-2">
        <p className="text-[10px] leading-relaxed text-ink-soft">{result.disclaimer.wording}</p>
      </div>
    </div>
  );
}

function TaxResultBody({ result }: { result: TaxDocumentResult }) {
  const {
    summary,
    document,
    requiredActions,
    keyDates,
    amounts,
    riskFlags,
    yourRights,
    validationWarnings,
  } = result;
  const guide = result.humanGuide;
  const materialWarnings = validationWarnings.filter((warning) =>
    MATERIAL_WARNING_FIELDS.has(warning.fieldKey.toUpperCase()),
  );
  const mainWarnings = materialWarnings.filter((warning) => {
    const key = warning.fieldKey.toUpperCase();
    return key !== "TAXPAYER_REFERENCE_NUMBER" && key !== "CASE_NUMBER";
  });
  const shouldShowCheck =
    document.confidence === "MEDIUM" ||
    document.confidence === "LOW" ||
    mainWarnings.length > 0;
  const hasExactReminder = result.reminderCandidates.length > 0;

  const mainTitle = guide?.whatThisIs ?? summary.headline;
  const mainMeaning = guide?.whatItMeans ?? summary.plainEnglish;
  const steps = guide?.nextSteps?.length
    ? guide.nextSteps
    : requiredActions.map((action) => ({
        id: action.id,
        title: action.action,
        detail: action.details,
        where: null,
        optional: action.priority !== "HIGH",
      }));
  const requiredItems = guide?.requiredItems ?? [];
  const guidanceSources = guide?.guidanceSources ?? [];
  const hasStepDestination = steps.some((step) => Boolean(step.where?.trim()));
  const shouldShowProfessionalHelp =
    result.escalation.recommended &&
    (document.confidence === "LOW" ||
      document.confidence === "MEDIUM" ||
      summary.severity === "CRITICAL" ||
      document.taxonomyDocumentType === "sars_customs_suspension_notice");

  return (
    <div className="space-y-3">
      <section className="rounded-[18px] border border-line bg-white p-4 shadow-[0_1px_0_rgba(31,42,36,0.03)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel>What this is</SectionLabel>
            <h2 className="mt-2 font-display text-[23px] font-semibold leading-[1.15] text-ink">
              {mainTitle}
            </h2>
          </div>
          <StampBadge
            label={severityLabel(summary.severity)}
            color={SEVERITY_COLOR[summary.severity]}
            className="mt-1 shrink-0 rotate-[-4deg]"
          />
        </div>

        <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.6] text-ink-soft">
          {mainMeaning}
        </p>

        {guide?.context ? (
          <div className="mt-3 rounded-[12px] bg-teal-dim px-3 py-2.5">
            <p className="text-[12px] font-semibold leading-relaxed text-ink">{guide.context}</p>
          </div>
        ) : null}
      </section>

      {guide?.whatSarsWants ? (
        <BlockCard title="What SARS wants" className="!rounded-[18px] !p-4">
          <p className="text-[13px] leading-relaxed text-ink">{guide.whatSarsWants}</p>
        </BlockCard>
      ) : null}

      {steps.length > 0 ? (
        <BlockCard title="Do this next" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex gap-3 rounded-[14px] bg-paper px-3 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-[12px] font-bold text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-semibold leading-snug text-ink">{step.title}</p>
                    {step.optional ? (
                      <span className="rounded-full border border-line bg-white px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.06em] text-ink-soft">
                        If needed
                      </span>
                    ) : null}
                  </div>
                  {step.detail ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{step.detail}</p>
                  ) : null}
                  {step.where ? (
                    <p className="mt-2 flex items-start gap-1.5 text-[11.5px] font-medium leading-relaxed text-teal">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {step.where}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </BlockCard>
      ) : null}

      {requiredItems.length > 0 ? (
        <BlockCard title="What you need" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {requiredItems.map((item) => (
              <div key={item.id} className="rounded-[14px] bg-paper px-3 py-3">
                <p className="text-[13.5px] font-semibold text-ink">{item.name}</p>
                {item.whatItIs ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{item.whatItIs}</p>
                ) : null}
                {item.whereToGet ? (
                  <div className="mt-2 border-t border-line/70 pt-2">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-teal">
                      Where to get it
                    </p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink">{item.whereToGet}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </BlockCard>
      ) : guide?.sourceGap ? (
        <BlockCard title="What you still need to check" className="!rounded-[18px] !p-4">
          <p className="text-[13px] leading-relaxed text-ink">{guide.sourceGap}</p>
        </BlockCard>
      ) : null}

      {guide?.whereToGo && !hasStepDestination ? (
        <BlockCard title="Where to submit / respond" className="!rounded-[18px] !p-4">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-ink">{guide.whereToGo}</p>
          </div>
        </BlockCard>
      ) : null}

      <BlockCard title="When" className="!rounded-[18px] !p-4">
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-ink">
            {guide?.deadline ??
              (result.reminderCandidates[0]
                ? `${result.reminderCandidates[0].label}: ${formatResultDate(result.reminderCandidates[0].dueDate)}.`
                : "No exact action deadline was found in this document. Check the original document before delaying.")}
          </p>
        </div>

        <Link
          to="/reminder"
          search={{ documentId: document.id }}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-line px-4 py-3 text-center text-[14px] font-semibold text-ink transition-colors active:bg-paper-2"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {hasExactReminder ? "Set a reminder" : "Add a reminder manually"}
        </Link>
      </BlockCard>

      {amounts.length > 0 ? (
        <BlockCard title="Amount" className="!rounded-[18px] !p-4">
          <div className="space-y-2.5">
            {amounts.map((amount) => (
              <div key={amount.id} className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-ink">{amount.label}</span>
                <span className="font-mono text-[12px] font-semibold text-ink">
                  {formatResultAmount(amount.amountCents, amount.currency)}
                </span>
              </div>
            ))}
          </div>
        </BlockCard>
      ) : null}

      {shouldShowCheck ? (
        <div className="rounded-[16px] border border-stamp-amber/35 bg-tint-sand p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-stamp-amber" aria-hidden="true" />
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Check this detail before you act</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                {materialWarnings.length > 0
                  ? warningCopy(mainWarnings.map((warning) => warning.fieldKey.toUpperCase()))
                  : "Some important wording was not clear enough to confirm automatically. Compare the action and dates with the original document."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <details className="group rounded-[16px] border border-line bg-white">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[13px] font-semibold text-ink">
          More details
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-5 border-t border-line px-4 py-4 text-[11.5px] leading-relaxed text-ink-soft">
          <div>
            <p className="font-semibold text-ink">Original document</p>
            {document.documentTitle ? (
              <p className="mt-1 text-ink">{document.documentTitle}</p>
            ) : null}
            {document.issueDate ? (
              <p className="mt-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Issued {formatResultDate(document.issueDate)}
              </p>
            ) : null}
            <p className="mt-1">Tax area: {friendlyTaxArea(result)}</p>
          </div>

          {keyDates.length > 0 ? (
            <div className="border-t border-dashed border-line pt-4">
              <p className="font-semibold text-ink">Dates mentioned in the document</p>
              <ul className="mt-2 space-y-1.5">
                {keyDates.map((keyDate) => (
                  <li key={keyDate.id} className="flex justify-between gap-4">
                    <span>{keyDate.label}</span>
                    <span className="shrink-0 font-medium text-ink">{formatResultDate(keyDate.date)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {yourRights.length > 0 ? (
            <div className="border-t border-dashed border-line pt-4">
              <p className="font-semibold text-ink">Rights & options</p>
              <div className="mt-2 space-y-3">
                {yourRights.map((right) => (
                  <div key={right.id} className="flex gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-ink">{right.right}</p>
                      {right.howToExercise ? <p className="mt-1">{right.howToExercise}</p> : null}
                      {right.legalBasis ? <p className="mt-1 text-[10px]">{right.legalBasis}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {riskFlags.length > 0 ? (
            <div className="border-t border-dashed border-line pt-4">
              <p className="font-semibold text-ink">If you ignore it</p>
              <div className="mt-2 space-y-3">
                {riskFlags.map((flag) => (
                  <div key={flag.id} className="flex gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-stamp-amber" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-ink">{flag.flag}</p>
                      {!sameMeaning(flag.flag, flag.explanation) ? (
                        <p className="mt-1">{flag.explanation}</p>
                      ) : null}
                      {flag.legalBasis ? <p className="mt-1 text-[10px]">{flag.legalBasis}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {shouldShowProfessionalHelp ? (
            <div className="border-t border-dashed border-line pt-4">
              <div className="flex gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-ink">Professional help</p>
                  {result.escalation.suggestedProfessional === "tax_practitioner" ? (
                    <p className="mt-1">
                      If you are unsure how to respond, a SARS-registered tax practitioner or accountant can help you check the next step.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {guidanceSources.length > 0 ? (
            <div className="border-t border-dashed border-line pt-4">
              <p className="font-semibold text-ink">SARS guidance used</p>
              <div className="mt-2 space-y-2">
                {guidanceSources.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-teal underline decoration-teal/30 underline-offset-2"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {materialWarnings.length > 0 ? (
            <div className="border-t border-dashed border-line pt-4">
              <p className="font-semibold text-ink">Details to double-check</p>
              <ul className="mt-1.5 space-y-1">
                {materialWarnings.slice(0, 5).map((warning) => (
                  <li key={`${warning.fieldKey}-${warning.code}`}>
                    • {warning.fieldKey.replaceAll("_", " ").toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="border-t border-dashed border-line pt-4">
            <p>{result.disclaimer.wording}</p>
          </div>
        </div>
      </details>
    </div>
  );
}

