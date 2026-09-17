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
import { LeaseAskSection } from "@/components/untangle/LeaseAskSection";
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
  type LeaseFinancialImpactItem,
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const baseSections = resultSectionsForModule(result?.document.module ?? null);
  // LeaseCheck Ask availability comes from the result's own capability metadata.
  const leaseAsk = result && isLeaseResult(result) ? result.ask : undefined;
  const sections = baseSections.map((section) =>
    section.id === "ask" && leaseAsk?.supported === true
      ? { ...section, available: true }
      : section,
  );
  const [active, setActive] = useState<string>(baseSections[0]?.id ?? "overview");
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
            documentId={documentId}
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
  EFFECTIVE_DATE: "effective date",
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

function leaseWarningLabels(
  warnings: NonNullable<LeaseDocumentResult["validationWarnings"]>,
): string[] {
  return [...new Set(warnings.map((warning) => leaseWarningFieldLabel(warning.fieldKey)))];
}

const LEASE_TERM_WARNING_WORDS: Record<string, string[]> = {
  LEASE_START_DATE: ["lease start", "start date", "commencement", "effective date"],
  START_DATE: ["lease start", "start date", "commencement", "effective date"],
  OCCUPATION_DATE: ["occupation date", "occupation"],
  LEASE_END_DATE: ["lease end", "end date", "expiry", "termination date"],
  END_DATE: ["lease end", "end date", "expiry", "termination date"],
  NOTICE_PERIOD: ["notice period", "notice"],
  RENT_AMOUNT: ["rent", "rental", "payment"],
  DEPOSIT_AMOUNT: ["deposit"],
  EFFECTIVE_DATE: ["effective date", "effective"],
};

function practicalLeaseCopy(value: string): string {
  return value
    .replace(/statutory cancellation right/gi, "cancellation rights under the law")
    .replace(/\ban\s+approved\s+(legal\s+)?rule\b/gi, "a legal rule we checked")
    .replace(/approved legal rule/gi, "legal guidance we checked")
    .replace(/approved rule/gi, "legal guidance we checked")
    .replace(/legal proposition/gi, "legal point")
    .replace(/applicability has not been established/gi, "it is not clear whether this applies")
    .replace(/statutory position/gi, "legal position")
    .replace(/legal heads-up/gi, "important point");
}

function leaseTermNeedsCheck(
  label: string,
  warnings: NonNullable<LeaseDocumentResult["validationWarnings"]>,
): boolean {
  const normalizedLabel = label.toLowerCase();
  return warnings.some((warning) => {
    const keys = warning.fieldKey.split("/").map((part) => part.trim().toUpperCase());
    return keys.some((key) =>
      (LEASE_TERM_WARNING_WORDS[key] ?? [leaseWarningFieldLabel(key)]).some((word) =>
        normalizedLabel.includes(word),
      ),
    );
  });
}

function LeaseTermRow({
  label,
  value,
  needsCheck,
}: {
  label: string;
  value: string;
  needsCheck: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl bg-paper px-3 py-2.5">
      <div className="min-w-0">
        <span className="text-[13px] text-ink-soft">{label}</span>
        {needsCheck ? (
          <span className="ml-2 inline-block rounded-full bg-tint-sand px-2 py-0.5 align-middle text-[10px] font-semibold text-stamp-amber">
            Check this
          </span>
        ) : null}
      </div>
      <span className="max-w-[11rem] text-right text-[14px] font-semibold leading-snug text-ink">
        {value}
      </span>
    </div>
  );
}

/** Collapsible group used throughout Full details. */
function DetailsGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded-2xl border border-line/70 bg-white p-4" open={defaultOpen}>
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold text-ink">
        {title}
        <ChevronDown
          className="h-4 w-4 text-ink-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function SummarySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line/70 pt-6 first:border-t-0 first:pt-0">
      <h3 className="font-display text-[17px] font-semibold leading-snug text-ink">{title}</h3>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function SummaryFactRow({
  label,
  value,
  needsCheck = false,
}: {
  label: string;
  value: string;
  needsCheck?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,11rem)] items-start gap-3 py-2">
      <div className="min-w-0">
        <span className="text-[13px] text-ink-soft">{label}</span>
        {needsCheck ? (
          <span className="ml-2 inline-block rounded-full bg-tint-sand px-2 py-0.5 align-middle text-[10px] font-semibold text-stamp-amber">
            Check this
          </span>
        ) : null}
      </div>
      <span className="min-w-0 break-words text-right text-[14.5px] font-semibold leading-snug text-ink">
        {value}
      </span>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-soft">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LeaseQuote({ text }: { text: string }) {
  return (
    <div className="mt-2 rounded-lg border-l-2 border-teal bg-paper px-3 py-2.5">
      <p className="text-[11px] font-semibold text-ink-soft">What your lease says</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink">{text}</p>
    </div>
  );
}

const ENDING_WORDS = /cancel|terminat|notice|renew|end of lease|expiry/i;
const BREACH_WORDS = /breach|default|remed|repossess|arrears|eviction/i;

type LeaseFamilyView = "residential" | "commercial" | "vehicle" | "equipment" | "other";

function leaseFamilyView(family?: string): LeaseFamilyView {
  const normalized = family?.trim().toUpperCase() ?? "";
  if (normalized.includes("RESIDENTIAL")) return "residential";
  if (normalized.includes("COMMERCIAL")) return "commercial";
  if (normalized.includes("VEHICLE") || normalized.includes("MOTOR")) return "vehicle";
  if (
    normalized.includes("EQUIPMENT") ||
    normalized.includes("PLANT") ||
    normalized.includes("MACHINERY")
  ) {
    return "equipment";
  }
  return "other";
}

const LEASE_FAMILY_WORDING: Record<
  LeaseFamilyView,
  { description: string; otherPartyResponsibilities: string }
> = {
  residential: {
    description: "This is a residential property lease agreement.",
    otherPartyResponsibilities: "Landlord responsibilities",
  },
  commercial: {
    description: "This is a commercial property lease agreement.",
    otherPartyResponsibilities: "Landlord / lessor responsibilities",
  },
  vehicle: {
    description: "This is a vehicle lease or rental agreement.",
    otherPartyResponsibilities: "Owner / lessor responsibilities",
  },
  equipment: {
    description: "This is a plant and equipment hire agreement.",
    otherPartyResponsibilities: "Owner responsibilities",
  },
  other: {
    description: "This is a lease or hire agreement.",
    otherPartyResponsibilities: "Other party responsibilities",
  },
};

function leasePaymentLabel(label: string, family: LeaseFamilyView): string {
  const normalized = label.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const isDeposit = /\bdeposit\b/.test(normalized);
  const isInitiation = /\binitiation\b/.test(normalized);
  const isServiceFee = /\bservice fee\b/.test(normalized);
  const isTotalRepayable = /\btotal (?:amount )?repayable\b/.test(normalized);
  const isInitial = /\b(initial|upfront|up front)\b/.test(normalized);
  const isAdmin = /\b(admin|administration)\b/.test(normalized);
  const isTax = /\b(vat|tax)\b/.test(normalized);
  const isResidual = /\b(balloon|residual)\b/.test(normalized);
  const isPeriodic = /\b(periodic|recurring|weekly|fortnightly)\b/.test(normalized);
  const isMonthly = /\bmonthly\b/.test(normalized);
  const isRent = /\brent(?:al)?\b/.test(normalized);
  const isCharge = /\b(charge|payment|amount|fee)\b/.test(normalized);

  if (isDeposit) return "Deposit";
  if (isTotalRepayable) return "Total amount repayable";
  if (isInitiation) return "Initiation fee";
  if (isServiceFee) return "Monthly service fee";
  if (family === "equipment") {
    if (isAdmin) return "Administration fee";
    if (isTax) return "VAT / tax charges";
    if (isPeriodic || isMonthly) return "Periodic hire payment";
    if (isRent || isCharge) return "Hire charge";
  }
  if (family === "vehicle") {
    if (isResidual) return "Balloon / residual amount";
    if (isMonthly) return "Monthly payment";
    if (isRent || isPeriodic) return "Rental payment";
  }
  if (family === "residential" || family === "commercial") {
    if (isInitial) return "Initial payment";
    if (isRent) return "Rent";
  }
  return label;
}

function leaseProblemTitle(title: string, explanation: string, family: LeaseFamilyView): string {
  if (family !== "equipment") return title;
  const text = `${title} ${explanation}`.toLowerCase();
  if (
    /miss(?:ed|ing)? (?:a )?payment|late payment|non-payment|payment default|arrears/.test(text)
  ) {
    return "If you miss a payment";
  }
  if (/damage|damaged/.test(text)) return "If the equipment is damaged";
  if (/breakdown|breaks down|mechanical failure/.test(text)) return "If the equipment breaks down";
  if (/cancel|terminat|end(?:ing|s)? the (?:lease|agreement)|expiry/.test(text)) {
    return "If either side ends the agreement";
  }
  if (/fee|penalt|extra charge/.test(text)) return "Extra charges or penalties";
  return title;
}

const FINANCIAL_IMPACT_ORDER = [
  "regular-payment",
  "scheduled-base-payments",
  "total-amount-repayable",
  "total-scheduled-commitment",
  "initiation-fee",
  "monthly-service-fee",
  "balloon-value",
  "residual-value",
  "deposit",
  "purchase-option-amount",
  "early-termination-estimate",
  "termination-charge-per-remaining-payment",
  "arrears",
  "amount-due",
  "late-payment-fee",
] as const;

function normalizedFinancialId(id: string): string {
  return id.trim().toLowerCase().replaceAll("_", "-");
}

/** The backend may return balloon and residual as one combined obligation. */
function isCombinedBalloonResidual(item: LeaseFinancialImpactItem): boolean {
  const haystack = `${normalizedFinancialId(item.id)} ${item.label.toLowerCase()}`;
  return /\bballoon\b/.test(haystack) && /\bresidual\b/.test(haystack);
}

function financialItemOrder(item: LeaseFinancialImpactItem): number {
  const id = isCombinedBalloonResidual(item) ? "balloon-value" : normalizedFinancialId(item.id);
  const index = FINANCIAL_IMPACT_ORDER.indexOf(id as (typeof FINANCIAL_IMPACT_ORDER)[number]);
  return index === -1 ? FINANCIAL_IMPACT_ORDER.length : index;
}

/** Show a combined balloon/residual obligation once; drop only matching separate items. */
function withoutDuplicateBalloonResidual(
  items: LeaseFinancialImpactItem[],
): LeaseFinancialImpactItem[] {
  const combined = items.find(isCombinedBalloonResidual);
  if (!combined || combined.amountCents === null) return items;
  return items.filter(
    (item) =>
      isCombinedBalloonResidual(item) ||
      !/balloon|residual/i.test(item.label) ||
      item.amountCents === null ||
      item.amountCents !== combined.amountCents,
  );
}

/** Declined or unselected optional products are choices, not responsibilities. */
function isDeclinedSelection(value: string): boolean {
  return (
    /\bdeclined?\b/i.test(value) ||
    /\bnone selected\b/i.test(value) ||
    /\bnot selected\b/i.test(value)
  );
}

function usefulFinancialItem(item: LeaseFinancialImpactItem): boolean {
  return item.amountCents !== null || item.explanation.trim().length > 0;
}

function financialImpactLabel(item: LeaseFinancialImpactItem, family: LeaseFamilyView): string {
  if (isCombinedBalloonResidual(item)) return "Final balloon / residual payment";
  switch (normalizedFinancialId(item.id)) {
    case "regular-payment":
      if (!/^regular[ _-]?payment$/i.test(item.label.trim())) {
        return leasePaymentLabel(item.label, family);
      }
      if (family === "vehicle") return "Regular vehicle payment";
      if (family === "equipment") return "Regular hire payment";
      if (family === "residential" || family === "commercial") return "Regular rent payment";
      return "Regular payment";
    case "scheduled-base-payments":
      return "Scheduled payments over the term";
    case "total-amount-repayable":
      return "Total amount repayable";
    case "total-scheduled-commitment":
      return "Estimated scheduled commitment";
    case "initiation-fee":
      return "Initiation fee";
    case "monthly-service-fee":
      return "Monthly service fee";
    case "balloon-value":
      return "Balloon amount";
    case "residual-value":
      return "Residual value";
    case "deposit":
      return "Deposit";
    case "purchase-option-amount":
      return "Optional purchase amount";
    case "early-termination-estimate":
      return "If you end it early";
    case "termination-charge-per-remaining-payment":
      return "Charge per remaining payment";
    case "arrears":
      return "Arrears";
    case "amount-due":
      return "Amount due";
    case "late-payment-fee":
      return "Late-payment fee";
    default:
      return item.label;
  }
}

/** Currency display only: no totals, rates or payment counts are derived here. */
function formatFinancialImpactAmount(amountCents: number, currency: string | null): string {
  const amount = amountCents / 100;
  if (currency?.toUpperCase() === "ZAR") {
    const value = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
    return `R ${value}`;
  }
  if (currency) {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 2 }).format(amount);
}

function plainInputLabel(value: string): string {
  const readable = value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : "";
}

function duplicatesFinancialImpactMoney(
  label: string,
  financialItems: LeaseFinancialImpactItem[],
): boolean {
  const normalizedLabel = label.toLowerCase();
  return financialItems.some((item) => {
    if (isCombinedBalloonResidual(item)) return /balloon|residual/.test(normalizedLabel);
    switch (normalizedFinancialId(item.id)) {
      case "regular-payment":
        if (/\bservice fee\b/.test(normalizedLabel)) return false;
        return /rent|rental|hire|regular|monthly|periodic|recurring payment/.test(normalizedLabel);
      case "deposit":
        return /deposit/.test(normalizedLabel);
      case "initiation-fee":
        return /initiation fee/.test(normalizedLabel);
      case "monthly-service-fee":
        return /monthly service fee|service fee/.test(normalizedLabel);
      case "total-amount-repayable":
        return /total (?:amount )?repayable/.test(normalizedLabel);
      case "scheduled-base-payments":
      case "total-scheduled-commitment":
        return /scheduled payments|scheduled commitment/.test(normalizedLabel);
      case "balloon-value":
      case "residual-value":
        return /balloon|residual/.test(normalizedLabel);
      case "purchase-option-amount":
        return /purchase option|buyout/.test(normalizedLabel);
      case "early-termination-estimate":
      case "termination-charge-per-remaining-payment":
        return /early termination|cancellation (?:charge|fee)|termination (?:charge|fee)/.test(
          normalizedLabel,
        );
      case "arrears":
        return /arrears/.test(normalizedLabel);
      case "amount-due":
        return /amount due/.test(normalizedLabel);
      case "late-payment-fee":
        return /late.payment fee/.test(normalizedLabel);
      default:
        return false;
    }
  });
}

function FinancialImpactSummary({
  items,
  family,
}: {
  items: LeaseFinancialImpactItem[];
  family: LeaseFamilyView;
}) {
  return (
    <div className="divide-y divide-line/60">
      {items.map((item) => {
        const id = normalizedFinancialId(item.id);
        const mainTotalId = items.some(
          (candidate) => normalizedFinancialId(candidate.id) === "total-amount-repayable",
        )
          ? "total-amount-repayable"
          : "total-scheduled-commitment";
        const isCommitment = id === mainTotalId;
        const isOptional = id === "purchase-option-amount";
        const isExposure = ["arrears", "amount-due", "late-payment-fee"].includes(id);
        return (
          <div key={item.id} className={isCommitment ? "rounded-xl bg-teal-dim px-3 py-3" : "py-3"}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-snug text-ink">
                  {financialImpactLabel(item, family)}
                </p>
                {item.status === "PARTIAL" ? (
                  <span className="mt-1 inline-block rounded-full bg-tint-sand px-2 py-0.5 text-[10px] font-semibold text-stamp-amber">
                    Partial estimate
                  </span>
                ) : isOptional ? (
                  <span className="mt-1 inline-block text-[11px] font-medium text-ink-soft">
                    Optional
                  </span>
                ) : isExposure ? (
                  <span className="mt-1 inline-block text-[11px] font-medium text-ink-soft">
                    Possible or current exposure
                  </span>
                ) : null}
              </div>
              {item.amountCents !== null ? (
                <span
                  className={`shrink-0 text-right font-semibold text-ink ${isCommitment ? "text-[19px]" : "text-[15px]"}`}
                >
                  {formatFinancialImpactAmount(item.amountCents, item.currency)}
                </span>
              ) : null}
            </div>
            {item.explanation.trim() ? (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                {item.explanation}
              </p>
            ) : null}
            {id === "deposit" ? (
              <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                Shown separately from the scheduled cost.
              </p>
            ) : null}
            {item.status === "PARTIAL" && item.missingInputs.length > 0 ? (
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                Still needed: {item.missingInputs.map(plainInputLabel).filter(Boolean).join(", ")}.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FinancialImpactDetails({
  items,
  warnings,
  family,
}: {
  items: LeaseFinancialImpactItem[];
  warnings: string[];
  family: LeaseFamilyView;
}) {
  return (
    <DetailsGroup title="How these figures were worked out">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl bg-paper px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-semibold leading-snug text-ink">
                {financialImpactLabel(item, family)}
              </p>
              {item.amountCents !== null ? (
                <span className="shrink-0 text-[13px] font-semibold text-ink">
                  {formatFinancialImpactAmount(item.amountCents, item.currency)}
                </span>
              ) : null}
            </div>
            {item.status === "PARTIAL" ? (
              <p className="mt-1 text-[11px] font-semibold text-stamp-amber">Partial estimate</p>
            ) : null}
            {item.explanation.trim() ? (
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{item.explanation}</p>
            ) : null}
            {item.formula?.trim() ? (
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">Method: </span>
                {item.formula}
              </p>
            ) : null}
            {item.missingInputs.length > 0 ? (
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">Still needed: </span>
                {item.missingInputs.map(plainInputLabel).filter(Boolean).join(", ")}.
              </p>
            ) : null}
          </div>
        ))}
        {warnings.length > 0 ? (
          <div className="border-t border-line pt-3">
            <p className="text-[12.5px] font-semibold text-ink">Important notes</p>
            <ul className="mt-2 space-y-2">
              {warnings
                .filter((warning) => warning.trim())
                .map((warning) => (
                  <li key={warning} className="text-[12.5px] leading-relaxed text-ink-soft">
                    {warning}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>
    </DetailsGroup>
  );
}

function leaseSummaryMeaning(value: string, family: LeaseFamilyView): string {
  const clean = value.trim();
  if (family === "other" || !/^this is\b/i.test(clean)) return firstSentence(clean);
  const first = firstSentence(clean);
  if (!/\b(lease|rental|hire|agreement|document)\b/i.test(first)) return first;
  return firstSentence(clean.slice(first.length).trim());
}

/** Short bullet form of a longer contractual sentence. */
function shortBullet(value: string): string {
  const head = firstSentence(practicalLeaseCopy(value)).replace(/\s+/g, " ").trim();
  return head.length > 140 ? `${head.slice(0, 137).trimEnd()}…` : head;
}

function agreementSays(value: string): string {
  const statement = shortBullet(value)
    .replace(/^the agreement says\s*/i, "")
    .trim();
  if (!statement) return "";
  return `The agreement says ${statement.charAt(0).toLowerCase()}${statement.slice(1)}`;
}

function leaseQuestions(family: LeaseFamilyView): string[] {
  if (family === "vehicle") {
    return [
      "What happens if I settle early?",
      "Is the balloon compulsory?",
      "Do I own the vehicle after the last payment?",
      "What happens if I miss a payment?",
      "What would I owe if I cancelled now?",
    ];
  }
  if (family === "equipment") {
    return [
      "What happens if I end the hire early?",
      "Who pays if the equipment breaks down?",
      "What happens if I miss a payment?",
      "What condition must I return the equipment in?",
    ];
  }
  return [
    "How can I cancel this lease?",
    "Who pays for maintenance?",
    "What happens if payment is late?",
    "What happens to the deposit?",
  ];
}

function unclearEndPosition(family: LeaseFamilyView): string {
  if (family === "vehicle" || family === "equipment") {
    return "The agreement does not clearly confirm what happens to ownership, purchase or return at the end.";
  }
  return "The agreement does not clearly confirm what must happen at the end of the term.";
}

function LeaseResultBody({
  result,
  documentId,
  section,
  onNavigate,
  productName,
}: {
  result: LeaseDocumentResult;
  documentId: string;
  section: string;
  onNavigate: (id: string) => void;
  productName: string;
}) {
  const { summary, document, humanGuide, yourRights } = result;
  const validationWarnings = result.validationWarnings ?? [];
  const keyTerms = humanGuide.keyTerms ?? [];
  const askCapability = result.ask?.supported === true ? result.ask : null;
  const family = leaseFamilyView(document.family);
  const familyWording = LEASE_FAMILY_WORDING[family];
  const financialImpactItems = withoutDuplicateBalloonResidual(
    (result.financialImpact?.items ?? []).filter(usefulFinancialItem),
  ).sort((left, right) => financialItemOrder(left) - financialItemOrder(right));
  const financialImpactWarnings = (result.financialImpact?.warnings ?? []).filter((warning) =>
    warning.trim(),
  );
  const summaryMoney = humanGuide.importantMoney.filter(
    (item) => !duplicatesFinancialImpactMoney(item.label, financialImpactItems),
  );
  const tenantResponsibilities = humanGuide.tenantResponsibilities.filter(
    (value) => !isDeclinedSelection(value),
  );
  const landlordResponsibilities = humanGuide.landlordResponsibilities.filter(
    (value) => !isDeclinedSelection(value),
  );
  const hasResponsibilities =
    tenantResponsibilities.length > 0 || landlordResponsibilities.length > 0;

  if (section === "ask") {
    return askCapability ? (
      <LeaseAskSection documentId={documentId} capability={askCapability} />
    ) : (
      <AskSectionPlaceholder productName={productName} />
    );
  }

  if (section === "details") {
    return (
      <div className="space-y-3">
        {humanGuide.importantMoney.length > 0 ? (
          <DetailsGroup title="Money and costs">
            <div className="space-y-2">
              {humanGuide.importantMoney.map((item) => (
                <LeaseTermRow
                  key={item.id}
                  label={leasePaymentLabel(item.label, family)}
                  value={item.value}
                  needsCheck={leaseTermNeedsCheck(item.label, validationWarnings)}
                />
              ))}
            </div>
          </DetailsGroup>
        ) : null}

        {humanGuide.importantDates.length > 0 ? (
          <DetailsGroup title="Dates and periods">
            <div className="space-y-2">
              {humanGuide.importantDates.map((item) => (
                <LeaseTermRow
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  needsCheck={leaseTermNeedsCheck(item.label, validationWarnings)}
                />
              ))}
            </div>
          </DetailsGroup>
        ) : null}

        {hasResponsibilities ? (
          <DetailsGroup title="Responsibilities">
            {tenantResponsibilities.length > 0 ? (
              <div>
                <p className="text-[13px] font-semibold text-ink">Your responsibilities</p>
                <div className="mt-2">
                  <Bullets items={tenantResponsibilities} />
                </div>
              </div>
            ) : null}
            {landlordResponsibilities.length > 0 ? (
              <div
                className={
                  tenantResponsibilities.length > 0 ? "mt-4 border-t border-line pt-4" : ""
                }
              >
                <p className="text-[13px] font-semibold text-ink">
                  {familyWording.otherPartyResponsibilities}
                </p>
                <div className="mt-2">
                  <Bullets items={landlordResponsibilities} />
                </div>
              </div>
            ) : null}
            <p className="mt-3 text-[11px] leading-relaxed text-ink-soft">
              LeaseCheck only assigns a responsibility when the accepted lease wording does.
            </p>
          </DetailsGroup>
        ) : null}

        {keyTerms.length > 0 ? (
          <DetailsGroup title="Other terms">
            <div className="space-y-2">
              {keyTerms.map((item) => (
                <LeaseTermRow
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  needsCheck={leaseTermNeedsCheck(item.label, validationWarnings)}
                />
              ))}
            </div>
          </DetailsGroup>
        ) : null}

        {humanGuide.clausesToCheck.length > 0 ? (
          <DetailsGroup title="Clauses to check">
            <div className="space-y-3">
              {humanGuide.clausesToCheck.map((flag) => (
                <div key={flag.id} className="rounded-xl bg-paper px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-semibold leading-snug text-ink">{flag.title}</p>
                    <ClauseSeverity severity={flag.severity} />
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    {practicalLeaseCopy(flag.explanation)}
                  </p>
                  {flag.leaseText ? <LeaseQuote text={flag.leaseText} /> : null}
                </div>
              ))}
            </div>
          </DetailsGroup>
        ) : null}

        <DetailsGroup title="Original wording">
          <p className="text-[14px] leading-relaxed text-ink">{humanGuide.whatYouAreAgreeingTo}</p>
        </DetailsGroup>

        {humanGuide.whereToGetHelp ? (
          <DetailsGroup title="Where to get help">
            <p className="text-[14px] leading-relaxed text-ink">{humanGuide.whereToGetHelp}</p>
          </DetailsGroup>
        ) : null}

        {financialImpactItems.length > 0 || financialImpactWarnings.length > 0 ? (
          <FinancialImpactDetails
            items={financialImpactItems}
            warnings={financialImpactWarnings}
            family={family}
          />
        ) : null}

        <LeaseLegalDetails result={result} />
      </div>
    );
  }

  // Summary — one coherent, practical answer.
  const dateItems = [
    ...humanGuide.importantDates,
    ...keyTerms.filter((item) => /notice|term|period|duration|renew/i.test(item.label)),
  ];
  const datesNeedCheck = dateItems.some((item) =>
    leaseTermNeedsCheck(item.label, validationWarnings),
  );
  const noticeItem = dateItems.find((item) => /notice/i.test(item.label));
  const endingClauses = humanGuide.clausesToCheck.filter((flag) =>
    ENDING_WORDS.test(`${flag.title} ${flag.explanation}`),
  );
  const breachClauses = humanGuide.clausesToCheck.filter((flag) =>
    BREACH_WORDS.test(`${flag.title} ${flag.explanation}`),
  );
  const problemClauses =
    family === "equipment"
      ? humanGuide.clausesToCheck.filter((flag) =>
          /breach|default|remed|repossess|arrears|damage|breakdown|mechanical failure|fee|penalt|extra charge/i.test(
            `${flag.title} ${flag.explanation}`,
          ),
        )
      : breachClauses;
  const paymentImpactItems = financialImpactItems.filter((item) =>
    ["regular-payment", "initiation-fee", "monthly-service-fee", "deposit"].includes(
      normalizedFinancialId(item.id),
    ),
  );
  const costImpactItems = financialImpactItems.filter((item) => {
    const id = normalizedFinancialId(item.id);
    return (
      [
        "scheduled-base-payments",
        "total-amount-repayable",
        "total-scheduled-commitment",
        "purchase-option-amount",
      ].includes(id) ||
      isCombinedBalloonResidual(item) ||
      id === "balloon-value" ||
      id === "residual-value"
    );
  });
  const earlyImpactItems = financialImpactItems.filter((item) =>
    ["early-termination-estimate", "termination-charge-per-remaining-payment"].includes(
      normalizedFinancialId(item.id),
    ),
  );
  const defaultImpactItems = financialImpactItems.filter((item) =>
    ["arrears", "amount-due", "late-payment-fee"].includes(normalizedFinancialId(item.id)),
  );
  const termItems = keyTerms.filter((item) => /term|duration/i.test(item.label)).slice(0, 1);
  const identityDates = humanGuide.importantDates.filter((item) =>
    /start|commence|effective|end|expir/i.test(item.label),
  );
  const endPositionItems = [...keyTerms, ...humanGuide.clausesToCheck]
    .filter((item) =>
      /ownership|title transfer|purchase option|return (?:the )?(?:vehicle|equipment)|what happens at the end/i.test(
        "value" in item ? `${item.label} ${item.value}` : `${item.title} ${item.explanation}`,
      ),
    )
    .slice(0, 2);
  const hasClearEndPosition = endPositionItems.length > 0;
  const questions = leaseQuestions(family);
  const summaryMeaning = leaseSummaryMeaning(summary.plainEnglish, family);
  const showSummaryMeaning =
    summaryMoney.length === 0 &&
    financialImpactItems.length === 0 &&
    dateItems.length === 0 &&
    !hasResponsibilities &&
    humanGuide.clausesToCheck.length === 0;

  return (
    <div className="space-y-3">
      <article className="overflow-hidden rounded-2xl border border-line/70 bg-white px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-teal">Analysis complete</p>
          <SeverityPill severity={summary.severity} />
        </div>
        <h2 className="mt-2 font-display text-[23px] font-semibold leading-[1.2] text-ink">
          Your lease in plain English
        </h2>
        <p className="mt-2 text-[14px] font-medium leading-snug text-ink-soft">
          {familyWording.description}
        </p>
        {document.documentTitle ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{document.documentTitle}</span>
          </p>
        ) : null}
        {showSummaryMeaning && summaryMeaning ? (
          <p className="mt-3 whitespace-pre-line text-[14.5px] leading-[1.6] text-ink-soft">
            {summaryMeaning}
          </p>
        ) : null}

        <div className="mt-7 space-y-6">
          <SummarySection title="What this agreement is">
            <div className="divide-y divide-line/60">
              {termItems.map((item) => (
                <SummaryFactRow
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  needsCheck={leaseTermNeedsCheck(item.label, validationWarnings)}
                />
              ))}
              {identityDates.map((item) => (
                <SummaryFactRow
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  needsCheck={leaseTermNeedsCheck(item.label, validationWarnings)}
                />
              ))}
            </div>
            {datesNeedCheck ? (
              <p className="mt-2 text-[12px] leading-relaxed text-stamp-amber">
                Some dates should be checked against the original document.
              </p>
            ) : null}
          </SummarySection>

          {summaryMoney.length > 0 || paymentImpactItems.length > 0 ? (
            <SummarySection title="What you are paying">
              {summaryMoney.length > 0 ? (
                <div className="divide-y divide-line/60">
                  {summaryMoney.map((item) => (
                    <SummaryFactRow
                      key={item.id}
                      label={leasePaymentLabel(item.label, family)}
                      value={item.value}
                      needsCheck={leaseTermNeedsCheck(item.label, validationWarnings)}
                    />
                  ))}
                </div>
              ) : null}
              {paymentImpactItems.length > 0 ? (
                <div className={summaryMoney.length > 0 ? "mt-2 border-t border-line/60 pt-1" : ""}>
                  <FinancialImpactSummary items={paymentImpactItems} family={family} />
                </div>
              ) : null}
            </SummarySection>
          ) : null}

          {costImpactItems.length > 0 ? (
            <SummarySection title="What this could cost">
              <FinancialImpactSummary items={costImpactItems} family={family} />
            </SummarySection>
          ) : null}

          <SummarySection title="What happens at the end">
            {endPositionItems.length > 0 ? (
              <div className="space-y-2">
                {endPositionItems.map((item) => (
                  <p key={item.id} className="text-[13.5px] leading-relaxed text-ink-soft">
                    {"value" in item
                      ? `${item.label}: ${item.value}`
                      : practicalLeaseCopy(firstSentence(item.explanation))}
                  </p>
                ))}
              </div>
            ) : null}
            {!hasClearEndPosition ? (
              <p className="text-[13.5px] leading-relaxed text-ink-soft">
                {unclearEndPosition(family)}
              </p>
            ) : null}
          </SummarySection>

          {noticeItem || endingClauses.length > 0 || earlyImpactItems.length > 0 ? (
            <SummarySection title="If you end it early">
              {noticeItem ? (
                <p className="text-[13.5px] leading-relaxed text-ink">
                  The agreement states a notice period of <strong>{noticeItem.value}</strong>.
                </p>
              ) : null}
              {endingClauses.slice(0, 2).map((flag) => (
                <p key={flag.id} className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                  {agreementSays(flag.explanation)}
                </p>
              ))}
              {earlyImpactItems.length > 0 ? (
                <div className="mt-3 border-t border-line/60 pt-2">
                  <FinancialImpactSummary items={earlyImpactItems} family={family} />
                </div>
              ) : null}
            </SummarySection>
          ) : null}

          {problemClauses.length > 0 || defaultImpactItems.length > 0 ? (
            <SummarySection title={family === "equipment" ? "If something goes wrong" : "If you default"}>
              <div className="space-y-3">
                {problemClauses.slice(0, 3).map((flag) => (
                  <div key={flag.id}>
                    <p className="text-[13.5px] font-semibold text-ink">
                      {leaseProblemTitle(flag.title, flag.explanation, family)}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                      {agreementSays(flag.explanation)}
                    </p>
                  </div>
                ))}
              </div>
              {defaultImpactItems.length > 0 ? (
                <div className="mt-3 border-t border-line/60 pt-2">
                  <p className="pt-1 text-[12.5px] leading-relaxed text-ink-soft">
                    The agreement says these charges or amounts may apply.
                  </p>
                  <FinancialImpactSummary items={defaultImpactItems} family={family} />
                </div>
              ) : null}
            </SummarySection>
          ) : null}

          {tenantResponsibilities.length > 0 ? (
            <SummarySection title="Your responsibilities">
              <Bullets items={tenantResponsibilities.slice(0, 6).map(shortBullet)} />
            </SummarySection>
          ) : null}

          {landlordResponsibilities.length > 0 ? (
            <SummarySection title={familyWording.otherPartyResponsibilities}>
              <Bullets items={landlordResponsibilities.slice(0, 5).map(shortBullet)} />
            </SummarySection>
          ) : null}

          {yourRights.length > 0 ? (
            <SummarySection title="Your rights and important protections">
              <div className="space-y-3">
                {yourRights.slice(0, 3).map((right) => (
                  <div key={right.id} className="flex gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    <div>
                      <p className="text-[13.5px] font-semibold text-ink">{right.title}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                        {practicalLeaseCopy(firstSentence(right.explanation))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigate("details")}
                className="mt-3 min-h-[44px] text-[13px] font-semibold text-teal"
              >
                See Legal details
              </button>
            </SummarySection>
          ) : null}

          <SummarySection title="Questions you may want to ask">
            <ul className="divide-y divide-line/60">
              {questions.map((question) => (
                <li
                  key={question}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-[13.5px] leading-relaxed text-ink-soft"
                >
                  <span className="min-w-0">{question}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                </li>
              ))}
            </ul>
            <div className="mt-4">
              {askCapability ? (
                <NextSectionButton label="Ask LeaseCheck" onClick={() => onNavigate("ask")} />
              ) : (
                <AskComingSoonButton />
              )}
            </div>
          </SummarySection>
        </div>
      </article>

      <ResultNavRow
        label="Full details"
        hint="Every extracted term, the original wording and legal detail"
        onClick={() => onNavigate("details")}
      />
    </div>
  );
}

/** All legal material, collapsed by default and always last. */
function LeaseLegalDetails({ result }: { result: LeaseDocumentResult }) {
  const { humanGuide, yourRights } = result;
  return (
    <details className="group rounded-2xl border border-line/70 bg-white p-4">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-semibold text-ink">
        Legal details
        <ChevronDown
          className="h-4 w-4 text-ink-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      {humanGuide.clausesToCheck.some(
        (flag) => flag.legalBasis || (flag.legalBases?.length ?? 0) > 0,
      ) ? (
        <div className="mt-3 space-y-3">
          {humanGuide.clausesToCheck.map((flag) => {
            const bases = flag.legalBases ?? [];
            return flag.legalBasis || bases.length > 0 ? (
              <div key={flag.id}>
                <p className="text-[12.5px] font-semibold text-ink">{flag.title}</p>
                {flag.legalBasis ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                    {flag.legalBasis}
                  </p>
                ) : null}
                {bases.map((basis) => (
                  <p
                    key={`${basis.sourceId}-${basis.provision}`}
                    className="mt-1 text-[12px] leading-relaxed text-ink-soft"
                  >
                    {basis.title}
                    {basis.provision ? ` — ${basis.provision}` : ""}
                  </p>
                ))}
              </div>
            ) : null;
          })}
        </div>
      ) : null}
      {yourRights.length > 0 ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[12.5px] font-semibold text-ink">Protections that may apply</p>
          <div className="mt-2 space-y-3">
            {yourRights.map((right) => (
              <div key={right.id} className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">{right.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                    {right.explanation}
                  </p>
                  {right.legalBasis ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                      {right.legalBasis}
                    </p>
                  ) : null}
                  {(right.legalBases ?? []).map((basis) => (
                    <p
                      key={`${basis.sourceId}-${basis.provision}`}
                      className="mt-1 text-[12px] leading-relaxed text-ink-soft"
                    >
                      {basis.title}
                      {basis.provision ? ` — ${basis.provision}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {humanGuide.legalNotes.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-line pt-3">
          {humanGuide.legalNotes.map((note) => (
            <p key={note} className="text-[12.5px] leading-relaxed text-ink-soft">
              {note}
            </p>
          ))}
        </div>
      ) : null}
      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[12.5px] leading-relaxed text-ink-soft">{result.disclaimer.wording}</p>
      </div>
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
                  <p className="text-[13px] leading-relaxed text-ink-soft">{guide.whatSarsWants}</p>
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
                    {flag.legalBasis ||
                    (!sameMeaning(flag.flag, flag.explanation) &&
                      hasMoreThanFirstSentence(flag.explanation)) ? (
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
