import { useState, type ReactNode } from "react";
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
  ChevronRight,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { AskSectionPlaceholder, ResultSectionNav } from "@/components/untangle/ResultSectionNav";
import {
  AskComingSoonButton,
  Disclosure,
  ResultFooterDisclaimer,
  ResultNavRow,
  ResultPrimaryButton,
} from "@/components/untangle/ResultBlocks";
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
import { resultSectionsForModule, solutionForModule } from "@/lib/solutions";
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
        content:
          "A plain-English answer that tells you what the document means and what to do next.",
      },
      { property: "og:title", content: "Document result — Untangle" },
      {
        property: "og:description",
        content:
          "A plain-English answer that tells you what the document means and what to do next.",
      },
    ],
  }),
  component: withAuth(Result),
});

const SEVERITY_STYLE: Record<ResultSeverity, string> = {
  INFO: "bg-teal-dim text-teal",
  ACTION_NEEDED: "bg-tint-sand text-stamp-amber",
  URGENT: "bg-tint-red text-stamp-red",
  CRITICAL: "bg-tint-red text-stamp-red",
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
  const sections = resultSectionsForModule(result?.document.module ?? null);
  const [active, setActive] = useState<string>(sections[0]?.id ?? "overview");
  const productName = solutionForModule(result?.document.module ?? null)?.name ?? "Untangle";

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line/60 bg-paper/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-2">
            <Link
              to={back.to}
              className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors active:bg-paper-2"
              aria-label={`Back to ${back.label}`}
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </Link>
            <h1 className="min-w-0 truncate font-display text-[18px] font-semibold text-ink">
              {result?.document.moduleDisplayName ?? "Result"}
            </h1>
          </div>
          {result ? (
            <div className="mt-2">
              <ResultSectionNav sections={sections} active={active} onSelect={setActive} />
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        {documentId === "" ? (
          <StateMessage
            title="We could not find this result"
            body="Open the document again from Documents to view its result."
          />
        ) : isPending ? (
          <StateMessage title="Loading your result…" body="One moment while we fetch it." />
        ) : error || !result ? (
          <StateMessage
            title="This result could not be loaded"
            body={friendlyDocumentError(error)}
          />
        ) : isLeaseResult(result) ? (
          <LeaseResultBody
            result={result}
            section={active}
            onNavigate={setActive}
            productName={productName}
          />
        ) : (
          <TaxResultBody
            result={result}
            section={active}
            onNavigate={setActive}
            productName={productName}
          />
        )}
      </main>
    </div>
  );
}

function StateMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="font-display text-[20px] font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-[300px] text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

/** Plain white panel used for every result group. */
function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line/70 bg-white p-4 ${className}`}>
      {title ? <h3 className="text-[13px] font-semibold text-ink-soft">{title}</h3> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
}

function SeverityPill({ severity }: { severity: ResultSeverity }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${SEVERITY_STYLE[severity]}`}
    >
      {severityLabel(severity)}
    </span>
  );
}

function NextSectionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-teal px-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.99]"
    >
      {label}
      <ChevronRight size={17} aria-hidden />
    </button>
  );
}

function Disclaimer({ wording }: { wording: string }) {
  return <p className="px-1 pt-2 text-[10.5px] leading-relaxed text-ink-soft">{wording}</p>;
}

function friendlyTaxArea(result: TaxDocumentResult): string {
  const { taxType, taxonomyDocumentType, taxpayerType } = result.document;

  if (
    taxonomyDocumentType === "sars_cit_verification_final_request" ||
    taxonomyDocumentType === "sars_company_assessment_itr14"
  ) {
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
  const labels = [
    ...new Set(
      fieldKeys.map((key) => WARNING_LABELS[key] ?? key.replaceAll("_", " ").toLowerCase()),
    ),
  ];
  if (labels.length === 1) {
    return `Untangle could not confidently confirm the ${labels[0]}. Compare it with the original document before relying on it.`;
  }
  if (labels.length > 1) {
    return `Untangle could not confidently confirm: ${labels.slice(0, 3).join(", ")}. Compare these details with the original document before relying on them.`;
  }
  return "Some important wording was not clear enough to confirm automatically. Compare the action and dates with the original document.";
}

function sameMeaning(left: string, right: string): boolean {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  return normalize(left) === normalize(right);
}

function isLeaseResult(result: DocumentResult): result is LeaseDocumentResult {
  return result.document.module === "LEASE";
}

function ClauseSeverity({ severity }: { severity: "LOW" | "MEDIUM" | "HIGH" }) {
  const label =
    severity === "HIGH" ? "Needs attention" : severity === "MEDIUM" ? "Check this" : "Note";
  const style =
    severity === "HIGH"
      ? "bg-tint-red text-stamp-red"
      : severity === "MEDIUM"
        ? "bg-tint-sand text-stamp-amber"
        : "bg-paper-2 text-ink-soft";
  return (
    <span className={`shrink-0 rounded-full px-2 py-1 text-[10.5px] font-semibold ${style}`}>
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
      return (
        warning.message || `Check the ${label} against the original lease before relying on it.`
      );
  }
}

/** Prominent safety block. Never hidden behind a tab the customer may not open. */
function LeaseWarningBlock({
  warnings,
}: {
  warnings: NonNullable<LeaseDocumentResult["validationWarnings"]>;
}) {
  return (
    <div className="rounded-2xl border border-stamp-amber/40 bg-tint-sand p-4" role="alert">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-stamp-amber" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">Check against the original</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            Some important lease terms need you to compare them with the original before relying on
            them. LeaseCheck has not changed the extracted facts.
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.code}-${warning.fieldKey}-${index}`}
                className="flex gap-2 text-[12.5px] leading-relaxed text-ink"
              >
                <span className="text-stamp-amber" aria-hidden="true">
                  •
                </span>
                <span>{leaseWarningCopy(warning)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function LeaseResultBody({
  result,
  section,
  onNavigate,
  productName,
}: {
  result: LeaseDocumentResult;
  section: string;
  onNavigate: (id: string) => void;
  productName: string;
}) {
  const { summary, document, humanGuide, yourRights } = result;
  const validationWarnings = result.validationWarnings ?? [];
  const hasResponsibilities =
    humanGuide.tenantResponsibilities.length > 0 || humanGuide.landlordResponsibilities.length > 0;

  if (section === "ask") {
    return <AskSectionPlaceholder productName={productName} />;
  }

  if (section === "terms") {
    return (
      <div className="space-y-3">
        {humanGuide.importantMoney.length > 0 ? (
          <Panel title="Rent, deposit and other money">
            <div className="space-y-2">
              {humanGuide.importantMoney.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-xl bg-paper px-3 py-2.5"
                >
                  <span className="text-[13px] text-ink-soft">{item.label}</span>
                  <span className="text-right text-[14px] font-semibold text-ink">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              These figures come from the lease wording; LeaseCheck does not fill in missing
              amounts.
            </p>
          </Panel>
        ) : null}

        {humanGuide.importantDates.length > 0 ? (
          <Panel title="Lease period, escalation and notice">
            <div className="space-y-2">
              {humanGuide.importantDates.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-xl bg-paper px-3 py-2.5"
                >
                  <span className="text-[13px] text-ink-soft">{item.label}</span>
                  <span className="text-right text-[14px] font-semibold text-ink">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {hasResponsibilities ? (
          <Panel title="Maintenance, utilities and responsibilities">
            {humanGuide.tenantResponsibilities.length > 0 ? (
              <div>
                <p className="text-[13px] font-semibold text-ink">Tenant</p>
                <ul className="mt-2 space-y-2">
                  {humanGuide.tenantResponsibilities.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {humanGuide.landlordResponsibilities.length > 0 ? (
              <div
                className={
                  humanGuide.tenantResponsibilities.length > 0
                    ? "mt-4 border-t border-line pt-4"
                    : ""
                }
              >
                <p className="text-[13px] font-semibold text-ink">Landlord</p>
                <ul className="mt-2 space-y-2">
                  {humanGuide.landlordResponsibilities.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              LeaseCheck only assigns a responsibility when the accepted lease wording does.
            </p>
          </Panel>
        ) : null}

        <Panel title="What you are agreeing to">
          <p className="text-[14px] leading-relaxed text-ink">{humanGuide.whatYouAreAgreeingTo}</p>
        </Panel>

        <NextSectionButton label="See risks and next steps" onClick={() => onNavigate("risks")} />
      </div>
    );
  }

  if (section === "risks") {
    return (
      <div className="space-y-3">
        {validationWarnings.length > 0 ? <LeaseWarningBlock warnings={validationWarnings} /> : null}

        {humanGuide.clausesToCheck.length > 0 ? (
          <Panel title="Clauses to pay attention to">
            <div className="space-y-3">
              {humanGuide.clausesToCheck.map((flag) => (
                <div key={flag.id} className="rounded-xl bg-paper px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-semibold leading-snug text-ink">{flag.title}</p>
                    <ClauseSeverity severity={flag.severity} />
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    {flag.explanation}
                  </p>
                  {flag.leaseText ? (
                    <div className="mt-2 rounded-lg bg-white px-3 py-2 text-[12px] leading-relaxed text-ink">
                      <span className="font-semibold">Your lease says: </span>
                      {flag.leaseText}
                    </div>
                  ) : null}
                  {flag.legalBasis ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                      General legal context: {flag.legalBasis}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {yourRights.length > 0 ? (
          <Panel title="Protections that may matter">
            <div className="space-y-3">
              {yourRights.map((right) => (
                <div key={right.id} className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{right.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                      {right.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {humanGuide.nextSteps.length > 0 ? (
          <Panel title="Recommended next steps">
            <div className="space-y-3">
              {humanGuide.nextSteps.map((step, index) => (
                <div key={step.id} className="flex gap-3 rounded-xl bg-paper px-3 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-[12px] font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[14px] font-semibold leading-snug text-ink">{step.title}</p>
                    {step.detail ? (
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                        {step.detail}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] font-medium text-teal">
                      {step.sourceKind === "LEASE"
                        ? "Your lease says"
                        : step.sourceKind === "LAW_GENERAL"
                          ? "General legal guidance"
                          : "Untangle explanation"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {humanGuide.whereToGetHelp ? (
          <Panel title="Where to get help">
            <p className="text-[14px] leading-relaxed text-ink">{humanGuide.whereToGetHelp}</p>
          </Panel>
        ) : null}

        {humanGuide.legalNotes.length > 0 || humanGuide.guidanceSources.length > 0 ? (
          <details className="group rounded-2xl border border-line/70 bg-white p-4">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold text-ink">
              More details
              <ChevronDown
                className="h-4 w-4 text-ink-soft transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            {humanGuide.legalNotes.length > 0 ? (
              <div className="mt-3 space-y-2">
                {humanGuide.legalNotes.map((note) => (
                  <p key={note} className="text-[12.5px] leading-relaxed text-ink-soft">
                    {note}
                  </p>
                ))}
              </div>
            ) : null}
            {humanGuide.guidanceSources.length > 0 ? (
              <div className="mt-4 border-t border-line pt-3">
                <p className="text-[12.5px] font-semibold text-ink">Sources checked</p>
                <div className="mt-2 space-y-2">
                  {humanGuide.guidanceSources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[12.5px] font-medium leading-relaxed text-teal underline-offset-2 hover:underline"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </details>
        ) : null}

        <Disclaimer wording={result.disclaimer.wording} />
      </div>
    );
  }

  // Overview
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-line/70 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-teal">Analysis complete</p>
          <SeverityPill severity={summary.severity} />
        </div>
        <h2 className="mt-2 font-display text-[23px] font-semibold leading-[1.2] text-ink">
          {humanGuide.whatThisIs || summary.headline}
        </h2>
        {document.documentTitle ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{document.documentTitle}</span>
          </p>
        ) : null}
        <p className="mt-3 whitespace-pre-line text-[14.5px] leading-[1.6] text-ink-soft">
          {summary.plainEnglish}
        </p>
        {validationWarnings.length === 0 &&
        (document.confidence === "MEDIUM" || document.confidence === "LOW") ? (
          <div className="mt-3 rounded-xl bg-tint-sand px-3 py-2.5 text-[12.5px] leading-relaxed text-ink">
            Compare important money, dates and notice wording with the original lease before relying
            on it.
          </div>
        ) : null}
      </section>

      {validationWarnings.length > 0 ? <LeaseWarningBlock warnings={validationWarnings} /> : null}

      <div className="grid grid-cols-2 gap-3">
        <SummaryMetric
          label="Key terms"
          value={String(humanGuide.importantMoney.length + humanGuide.importantDates.length)}
        />
        <SummaryMetric label="Clauses to check" value={String(humanGuide.clausesToCheck.length)} />
      </div>

      <NextSectionButton label="View key findings" onClick={() => onNavigate("terms")} />
      <AskComingSoonButton />
      <Disclaimer wording={result.disclaimer.wording} />
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
      <p className="font-display text-[22px] font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[12.5px] text-ink-soft">{label}</p>
    </div>
  );
}

/** First sentence of a longer paragraph, used for the collapsed state. */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = /^[\s\S]*?[.!?](\s|$)/.exec(trimmed);
  const head = match ? match[0].trim() : trimmed;
  return head.length > 0 ? head : trimmed;
}

function hasMoreThanFirstSentence(text: string): boolean {
  return firstSentence(text).length < text.trim().length;
}

function TaxResultBody({
  result,
  section,
  onNavigate,
  productName,
}: {
  result: TaxDocumentResult;
  section: string;
  onNavigate: (id: string) => void;
  productName: string;
}) {
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
  const timeLimits = result.timeLimits ?? [];
  const materialWarnings = validationWarnings.filter((warning) =>
    MATERIAL_WARNING_FIELDS.has(warning.fieldKey.toUpperCase()),
  );
  const mainWarnings = materialWarnings.filter((warning) => {
    const key = warning.fieldKey.toUpperCase();
    return key !== "TAXPAYER_REFERENCE_NUMBER" && key !== "CASE_NUMBER";
  });
  const shouldShowCheck =
    document.confidence === "MEDIUM" || document.confidence === "LOW" || mainWarnings.length > 0;
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

  const dateCount = keyDates.length + timeLimits.length + (hasExactReminder ? 1 : 0);

  const checkBlock = shouldShowCheck ? (
    <div className="rounded-2xl border border-stamp-amber/40 bg-tint-sand p-4" role="alert">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-stamp-amber" aria-hidden="true" />
        <div>
          <p className="text-[14px] font-semibold text-ink">Check this detail before you act</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            {materialWarnings.length > 0
              ? warningCopy(mainWarnings.map((warning) => warning.fieldKey.toUpperCase()))
              : "Some important wording was not clear enough to confirm automatically. Compare the action and dates with the original document."}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  if (section === "ask") {
    return <AskSectionPlaceholder productName={productName} />;
  }

  if (section === "actions") {
    return (
      <div className="space-y-3">
        {checkBlock}

        {guide?.whatSarsWants ? (
          <Panel title="What SARS wants">
            <p className="text-[14px] leading-relaxed text-ink">
              {firstSentence(guide.whatSarsWants)}
            </p>
            {hasMoreThanFirstSentence(guide.whatSarsWants) ? (
              <div className="mt-2">
                <Disclosure title="More detail">
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    {guide.whatSarsWants}
                  </p>
                </Disclosure>
              </div>
            ) : null}
          </Panel>
        ) : null}

        {steps.length > 0 ? (
          <Panel title="Do this next">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="rounded-xl bg-paper px-3 py-3">
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-[12px] font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-semibold leading-snug text-ink">
                          {step.title}
                        </p>
                        {step.optional ? (
                          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-soft">
                            If needed
                          </span>
                        ) : null}
                      </div>
                      {step.detail ? (
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                          {firstSentence(step.detail)}
                        </p>
                      ) : null}
                      {step.where ? (
                        <p className="mt-2 flex items-start gap-1.5 text-[12.5px] font-medium leading-relaxed text-teal">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {step.where}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {step.detail && hasMoreThanFirstSentence(step.detail) ? (
                    <div className="mt-2 pl-10">
                      <Disclosure title="Why this matters">
                        <p className="text-[13px] leading-relaxed text-ink-soft">{step.detail}</p>
                      </Disclosure>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {requiredItems.length > 0 ? (
          <Panel title="What you need">
            <div className="space-y-2">
              {requiredItems.map((item) => (
                <Disclosure key={item.id} title={item.name}>
                  {item.whatItIs ? (
                    <p className="text-[13px] leading-relaxed text-ink-soft">{item.whatItIs}</p>
                  ) : null}
                  {item.whereToGet ? (
                    <div className="mt-2">
                      <p className="text-[12px] font-semibold text-teal">Where to get it</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink">
                        {item.whereToGet}
                      </p>
                    </div>
                  ) : null}
                </Disclosure>
              ))}
            </div>
          </Panel>
        ) : guide?.sourceGap ? (
          <Panel title="What you still need to check">
            <p className="text-[14px] leading-relaxed text-ink">{guide.sourceGap}</p>
          </Panel>
        ) : null}

        {guide?.whereToGo && !hasStepDestination ? (
          <Panel title="Where to submit or respond">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
              <p className="text-[14px] leading-relaxed text-ink">{guide.whereToGo}</p>
            </div>
          </Panel>
        ) : null}

        {riskFlags.length > 0 ? (
          <section className="rounded-2xl border border-stamp-amber/40 bg-white p-4">
            <h3 className="text-[13px] font-semibold text-stamp-amber">If you ignore it</h3>
            <div className="mt-3 space-y-3">
              {riskFlags.map((flag) => (
                <div key={flag.id} className="flex gap-2.5">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-stamp-amber"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink">{flag.flag}</p>
                    {!sameMeaning(flag.flag, flag.explanation) ? (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                        {firstSentence(flag.explanation)}
                      </p>
                    ) : null}
                    {(flag.legalBasis ||
                      (!sameMeaning(flag.flag, flag.explanation) &&
                        hasMoreThanFirstSentence(flag.explanation))) ? (
                      <div className="mt-2">
                        <Disclosure title="More detail">
                          <p className="text-[12.5px] leading-relaxed text-ink-soft">
                            {flag.explanation}
                          </p>
                          {flag.legalBasis ? (
                            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                              {flag.legalBasis}
                            </p>
                          ) : null}
                        </Disclosure>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <ResultPrimaryButton label="See important dates" onClick={() => onNavigate("dates")} />
        <ResultFooterDisclaimer wording={result.disclaimer.wording} />
      </div>
    );
  }

  if (section === "dates") {
    const deadlineCandidate = result.reminderCandidates[0];
    return (
      <div className="space-y-3">
        <Panel title="Deadlines">
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            <p className="text-[14px] leading-relaxed text-ink">
              {guide?.deadline ??
                (deadlineCandidate
                  ? `${deadlineCandidate.label}: ${formatResultDate(deadlineCandidate.dueDate)}.`
                  : "No exact action deadline was found in this document. Check the original document before delaying.")}
            </p>
          </div>

          {timeLimits.length > 0 ? (
            <div className="mt-3 space-y-2">
              {timeLimits.map((limit) => (
                <div key={limit.id} className="rounded-xl bg-paper px-3 py-2.5">
                  <p className="text-[13.5px] font-semibold text-ink">{limit.label}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                    {limit.periodText}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink">
                    <span className="font-semibold">Exact deadline: </span>
                    Not calculated —{" "}
                    {limit.caution ?? "confirm the date from which this period legally runs."}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <Link
            to="/reminder"
            search={{ documentId: document.id }}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-line px-4 text-center text-[15px] font-semibold text-ink transition-colors active:bg-paper-2"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {hasExactReminder ? "Set a reminder" : "Add a reminder manually"}
          </Link>
        </Panel>

        {keyDates.length > 0 ? (
          <Panel title="Dates in the document">
            <ul className="space-y-2">
              {keyDates.map((keyDate) => (
                <li
                  key={keyDate.id}
                  className="flex justify-between gap-4 text-[13px] text-ink-soft"
                >
                  <span>{keyDate.label}</span>
                  <span className="shrink-0 font-medium text-ink">
                    {formatResultDate(keyDate.date)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-soft">
              These are dates written in the document. They are not automatically deadlines.
            </p>
          </Panel>
        ) : null}

        {amounts.length > 0 ? (
          <Panel title="Amounts">
            <div className="space-y-2">
              {amounts.map((amount) => (
                <div
                  key={amount.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2.5"
                >
                  <span className="text-[13px] text-ink-soft">{amount.label}</span>
                  <span className="text-[14px] font-semibold text-ink">
                    {formatResultAmount(amount.amountCents, amount.currency)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {yourRights.length > 0 ? (
          <Panel title="Rights & options">
            <div className="space-y-2">
              {yourRights.map((right) => (
                <Disclosure key={right.id} title={right.right}>
                  {right.howToExercise ? (
                    <p className="text-[13px] leading-relaxed text-ink-soft">
                      {right.howToExercise}
                    </p>
                  ) : null}
                  {right.legalBasis ? (
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                      {right.legalBasis}
                    </p>
                  ) : null}
                </Disclosure>
              ))}
            </div>
          </Panel>
        ) : null}

        <Disclosure title="More details" tone="card">
          <div className="space-y-4 text-[12.5px] leading-relaxed text-ink-soft">
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

            {shouldShowProfessionalHelp ? (
              <div className="border-t border-line pt-3">
                <p className="font-semibold text-ink">Professional help</p>
                {result.escalation.suggestedProfessional === "tax_practitioner" ? (
                  <p className="mt-1">
                    If you are unsure how to respond, a SARS-registered tax practitioner or
                    accountant can help you check the next step.
                  </p>
                ) : null}
              </div>
            ) : null}

            {guidanceSources.length > 0 ? (
              <div className="border-t border-line pt-3">
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
              <div className="border-t border-line pt-3">
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
          </div>
        </Disclosure>

        <ResultFooterDisclaimer wording={result.disclaimer.wording} />
      </div>
    );
  }

  // Overview — the 10-second answer.
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-line/70 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-teal">Analysis complete</p>
          <SeverityPill severity={summary.severity} />
        </div>
        <h2 className="mt-2 text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] text-ink">
          {mainTitle}
        </h2>
        {document.documentTitle ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{document.documentTitle}</span>
          </p>
        ) : null}
        <p className="mt-3 text-[14.5px] leading-[1.55] text-ink-soft">
          {firstSentence(mainMeaning)}
        </p>
        {guide?.context ? (
          <p className="mt-3 rounded-xl bg-teal-dim px-3 py-2.5 text-[13px] font-medium leading-relaxed text-ink">
            {firstSentence(guide.context)}
          </p>
        ) : null}
        {hasMoreThanFirstSentence(mainMeaning) ||
        (guide?.context && hasMoreThanFirstSentence(guide.context)) ? (
          <div className="mt-3">
            <Disclosure title="More about this document">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                {mainMeaning}
              </p>
              {guide?.context ? (
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{guide.context}</p>
              ) : null}
            </Disclosure>
          </div>
        ) : null}
      </section>

      {checkBlock}

      {steps.length > 0 ? (
        <ResultNavRow
          label={`${steps.length} ${steps.length === 1 ? "action" : "actions"} to take`}
          onClick={() => onNavigate("actions")}
        />
      ) : null}
      {dateCount > 0 ? (
        <ResultNavRow
          label={`${dateCount} important ${dateCount === 1 ? "date" : "dates"}`}
          onClick={() => onNavigate("dates")}
        />
      ) : null}

      <ResultPrimaryButton
        label="See what you need to do"
        onClick={() => onNavigate(steps.length > 0 ? "actions" : "dates")}
      />
      <AskComingSoonButton />
      <ResultFooterDisclaimer wording={result.disclaimer.wording} />
    </div>
  );
}
