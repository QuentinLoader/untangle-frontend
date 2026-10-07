import { AlertTriangle, CalendarDays, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LeaseAskSection } from "@/components/untangle/LeaseAskSection";
import {
  EvidenceDisclosure,
  FactRows,
  KeyMetric,
  MeaningBlock,
  ResultSection,
  StatusBadge,
} from "@/components/untangle/v2/ResultPrimitives";
import {
  ResultWorkspace,
  type WorkspaceNavItem,
} from "@/components/untangle/v2/ResultWorkspace";
import {
  formatResultAmount,
  type LeaseDocumentResult,
  type LeaseFinancialImpactItem,
} from "@/lib/documents";

type BackTarget = { to: string; label: string };

const ENDING_WORDS = [
  "end",
  "ending",
  "termination",
  "terminate",
  "cancel",
  "cancellation",
  "settle",
  "settlement",
  "return",
  "renewal",
  "renew",
  "notice period",
];

const PROBLEM_WORDS = [
  "default",
  "breach",
  "late",
  "missed",
  "arrear",
  "enforcement",
  "repossess",
  "repossession",
  "penalty",
  "damage",
  "failure to pay",
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function containsAny(value: string, words: string[]): boolean {
  const normalized = normalize(value);
  return words.some((word) => normalized.includes(normalize(word)));
}

function friendlyFieldLabel(fieldKey: string): string {
  return fieldKey
    .split("/")
    .map((part) => part.trim().replaceAll("_", " ").toLowerCase())
    .join(" and ");
}

function financialPriority(label: string): number {
  const value = normalize(label);
  if (value.includes("monthly") && (value.includes("payment") || value.includes("instalment"))) return 1;
  if (value.includes("rent") && (value.includes("monthly") || value.includes("payment"))) return 1;
  if (value.includes("term") || value.includes("duration")) return 2;
  if (value.includes("total") && (value.includes("repay") || value.includes("payable"))) return 3;
  if (value.includes("balloon") || value.includes("residual")) return 4;
  if (value.includes("deposit")) return 5;
  return 20;
}

function usableFinancialItem(item: LeaseFinancialImpactItem): boolean {
  return item.amountCents !== null && item.status !== "NOT_CALCULABLE";
}

function metricValue(item: LeaseFinancialImpactItem): string {
  if (item.amountCents === null) return "Not confirmed";
  return formatResultAmount(item.amountCents, item.currency);
}

function attentionLabel(severity: "LOW" | "MEDIUM" | "HIGH"): string {
  if (severity === "HIGH") return "Needs attention";
  if (severity === "MEDIUM") return "Check this";
  return "Note";
}

function severityClass(severity: "LOW" | "MEDIUM" | "HIGH"): string {
  if (severity === "HIGH") return "border-red-200 bg-red-50 text-stamp-red";
  if (severity === "MEDIUM") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-line bg-paper-2 text-ink-soft";
}

function LeaseClause({
  clause,
}: {
  clause: LeaseDocumentResult["humanGuide"]["clausesToCheck"][number];
}) {
  return (
    <article className="border-t border-line/80 py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-6 text-ink">{clause.title}</h3>
        <span
          className={"inline-flex min-h-7 items-center rounded-full border px-2.5 text-[11.5px] font-semibold " + severityClass(clause.severity)}
        >
          {attentionLabel(clause.severity)}
        </span>
      </div>
      <p className="mt-2 text-[14px] leading-6 text-ink-soft">{clause.explanation}</p>
      {clause.leaseText ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-[12.5px] font-semibold text-teal">
            Show agreement wording
          </summary>
          <p className="mt-2 border-l-2 border-line pl-3 text-[13px] leading-6 text-ink">
            “{clause.leaseText}”
          </p>
        </details>
      ) : null}
      {clause.legalBasis ? (
        <p className="mt-3 text-[12px] leading-5 text-ink-soft">
          <span className="font-semibold text-ink">Checked rule context: </span>
          {clause.legalBasis}
        </p>
      ) : null}
    </article>
  );
}

function ResponsibilityList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-[13.5px] text-ink-soft">No responsibility was safely confirmed here.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
          <span className="mt-[8px] h-2 w-2 rounded-full bg-teal" aria-hidden />
          <span className="text-[14px] leading-6 text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ContextRail({
  result,
  documentId,
}: {
  result: LeaseDocumentResult;
  documentId: string;
}) {
  const warnings = result.validationWarnings ?? [];
  const confidence = result.document.confidence;
  const hasDates = result.humanGuide.importantDates.length > 0;

  return (
    <>
      <div className="rounded-[14px] border border-line bg-white p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Document</p>
            <p className="mt-1 text-[14px] font-semibold leading-5 text-ink">
              {result.document.documentTitle || result.humanGuide.whatThisIs || result.summary.headline}
            </p>
            {result.document.detectedDocumentType ? (
              <p className="mt-1 text-[12px] leading-5 text-ink-soft">{result.document.detectedDocumentType}</p>
            ) : null}
            {confidence ? (
              <p className="mt-2 text-[12px] text-ink-soft">
                Confidence: <span className="font-semibold text-ink">{confidence.toLowerCase()}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {warnings.length > 0 ? (
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-amber-900">Check this</p>
              <p className="mt-1 text-[13.5px] font-semibold leading-5 text-ink">
                {warnings.length === 1 ? "One detail needs checking." : String(warnings.length) + " details need checking."}
              </p>
              <ul className="mt-2 space-y-1">
                {warnings.slice(0, 3).map((warning) => (
                  <li key={warning.fieldKey + warning.code} className="text-[12px] leading-5 text-ink-soft">
                    {friendlyFieldLabel(warning.fieldKey)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {hasDates ? (
        <Link
          to="/reminder"
          search={{ documentId }}
          className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4 transition-colors hover:bg-paper-2"
        >
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">Set a reminder</span>
            <span className="mt-1 block text-[12px] leading-5 text-ink-soft">
              Use a date confirmed in this result or choose your own.
            </span>
          </span>
        </Link>
      ) : null}

      {result.ask?.supported === true ? (
        <a
          href="#ask"
          className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4 transition-colors hover:bg-paper-2"
        >
          <MessageSquare size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">Ask LeaseCheck</span>
            <span className="mt-1 block text-[12px] leading-5 text-ink-soft">
              Ask a grounded question about this agreement.
            </span>
          </span>
        </a>
      ) : null}
    </>
  );
}

export function LeaseResultV2({
  result,
  documentId,
  back,
}: {
  result: LeaseDocumentResult;
  documentId: string;
  back: BackTarget;
}) {
  const guide = result.humanGuide;
  const warnings = result.validationWarnings ?? [];
  const financialItems = (result.financialImpact?.items ?? [])
    .filter(usableFinancialItem)
    .slice()
    .sort((a, b) => financialPriority(a.label) - financialPriority(b.label));

  const metricLabels = new Set<string>();
  const metrics: Array<{ label: string; value: string; note?: string }> = [];

  for (const item of financialItems) {
    const key = normalize(item.label);
    if (metricLabels.has(key)) continue;
    metricLabels.add(key);
    metrics.push({
      label: item.label,
      value: metricValue(item),
      note: item.status === "PARTIAL" ? "Partially confirmed from the agreement." : undefined,
    });
    if (metrics.length >= 4) break;
  }

  for (const item of guide.importantMoney) {
    const key = normalize(item.label);
    if (metricLabels.has(key)) continue;
    metricLabels.add(key);
    metrics.push({ label: item.label, value: item.value });
    if (metrics.length >= 4) break;
  }

  const allMoneyRows: Array<{ label: string; value: string; note?: string }> = [];
  const moneySeen = new Set<string>();

  for (const item of financialItems) {
    const key = normalize(item.label);
    if (moneySeen.has(key)) continue;
    moneySeen.add(key);
    allMoneyRows.push({
      label: item.label,
      value: metricValue(item),
      note: item.explanation || undefined,
    });
  }

  for (const item of guide.importantMoney) {
    const key = normalize(item.label);
    if (moneySeen.has(key)) continue;
    moneySeen.add(key);
    allMoneyRows.push({ label: item.label, value: item.value });
  }

  const endingClauses = guide.clausesToCheck.filter((clause) =>
    containsAny(clause.title + " " + clause.explanation, ENDING_WORDS),
  );
  const endingIds = new Set(endingClauses.map((clause) => clause.id));
  const problemClauses = guide.clausesToCheck.filter(
    (clause) =>
      !endingIds.has(clause.id) &&
      containsAny(clause.title + " " + clause.explanation, PROBLEM_WORDS),
  );
  const classifiedIds = new Set([...endingIds, ...problemClauses.map((clause) => clause.id)]);
  const otherClauses = guide.clausesToCheck.filter((clause) => !classifiedIds.has(clause.id));

  const endingTerms = (guide.keyTerms ?? []).filter((item) =>
    containsAny(item.label + " " + item.value, ENDING_WORDS),
  );

  const topAttention = guide.clausesToCheck
    .slice()
    .sort((a, b) => {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
      return rank[a.severity] - rank[b.severity];
    })
    .slice(0, 3);

  const hasProtections =
    result.yourRights.length > 0 ||
    guide.legalNotes.length > 0 ||
    guide.guidanceSources.length > 0;

  const hasEvidence =
    guide.clausesToCheck.some((clause) => clause.leaseText || clause.legalBasis) ||
    guide.guidanceSources.length > 0;

  const navItems: WorkspaceNavItem[] = [
    { id: "summary", label: "Summary" },
    { id: "meaning", label: "What this means" },
    ...(allMoneyRows.length > 0 ? [{ id: "money", label: "Money" }] : []),
    ...(guide.tenantResponsibilities.length > 0 || guide.landlordResponsibilities.length > 0
      ? [{ id: "responsibilities", label: "Responsibilities" }]
      : []),
    ...(otherClauses.length > 0 ? [{ id: "clauses", label: "Important clauses" }] : []),
    ...(endingClauses.length > 0 || endingTerms.length > 0
      ? [{ id: "ending", label: "Ending the agreement" }]
      : []),
    ...(problemClauses.length > 0 ? [{ id: "problems", label: "If things go wrong" }] : []),
    ...(hasProtections ? [{ id: "protections", label: "Legal protections" }] : []),
    ...(hasEvidence ? [{ id: "evidence", label: "Evidence" }] : []),
    ...(result.ask?.supported === true ? [{ id: "ask", label: "Ask" }] : []),
  ];

  const documentLabel =
    result.document.documentTitle ||
    guide.whatThisIs ||
    result.document.detectedDocumentType ||
    "Lease document";

  return (
    <ResultWorkspace
      productName="LeaseCheck"
      portfolioLabel="Part of Untangle South Africa"
      documentLabel={documentLabel}
      navItems={navItems}
      context={<ContextRail result={result} documentId={documentId} />}
      backTo={back.to}
      backLabel={"Back to " + back.label}
      statusLabel="Analysis complete"
    >
      <div className="space-y-10">
        <ResultSection id="summary" title={result.summary.headline}>
          <div className="flex flex-wrap gap-2">
            <StatusBadge>{guide.whatThisIs || "Lease document"}</StatusBadge>
            {result.summary.severity === "URGENT" ? (
              <StatusBadge tone="critical">Urgent</StatusBadge>
            ) : result.summary.severity === "ACTION_NEEDED" ? (
              <StatusBadge tone="attention">Action needed</StatusBadge>
            ) : null}
          </div>

          <p className="mt-5 text-[16px] leading-7 text-ink-soft">{result.summary.plainEnglish}</p>

          {metrics.length > 0 ? (
            <div className="mt-6 border-y border-line lg:grid lg:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <KeyMetric
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  note={metric.note}
                />
              ))}
            </div>
          ) : null}

          {topAttention.length > 0 ? (
            <div className="mt-7">
              <h3 className="text-[16px] font-semibold text-ink">
                {topAttention.length === 1
                  ? "One thing to understand"
                  : String(topAttention.length) + " things to understand"}
              </h3>
              <ol className="mt-4 space-y-3">
                {topAttention.map((clause, index) => (
                  <li key={clause.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-dim text-[12px] font-semibold text-teal">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-[14px] font-semibold leading-6 text-ink">
                      {clause.title}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="mt-6 border-l-4 border-stamp-amber bg-amber-50 px-4 py-4">
              <div className="flex gap-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
                <div>
                  <p className="text-[14px] font-semibold text-ink">Check these details against the original</p>
                  <p className="mt-1 text-[13px] leading-6 text-ink-soft">
                    LeaseCheck could not safely confirm every important field. The detailed report marks the items that need checking.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </ResultSection>

        <ResultSection
          id="meaning"
          title="What this means for you"
          intro="This is the practical meaning of the agreement, kept separate from the original wording and legal guidance."
        >
          <MeaningBlock title="Your agreement">
            <p>{guide.whatYouAreAgreeingTo}</p>
          </MeaningBlock>

          {guide.nextSteps.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-[15px] font-semibold text-ink">What to do next</h3>
              <ol className="mt-3 space-y-3">
                {guide.nextSteps.map((step, index) => (
                  <li key={step.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-teal text-[12px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold leading-6 text-ink">{step.title}</p>
                      {step.detail ? (
                        <p className="mt-1 text-[13.5px] leading-6 text-ink-soft">{step.detail}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </ResultSection>

        {allMoneyRows.length > 0 ? (
          <ResultSection
            id="money"
            title="Money"
            intro="These figures come from the validated result. Untangle does not recalculate them in the browser."
          >
            <FactRows rows={allMoneyRows} />
            {(result.financialImpact?.warnings ?? []).length > 0 ? (
              <div className="mt-5 border-l-4 border-stamp-amber bg-amber-50 px-4 py-4">
                <p className="text-[13.5px] font-semibold text-ink">Financial details to check</p>
                <ul className="mt-2 space-y-1.5">
                  {(result.financialImpact?.warnings ?? []).map((warning) => (
                    <li key={warning} className="text-[13px] leading-5 text-ink-soft">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </ResultSection>
        ) : null}

        {guide.tenantResponsibilities.length > 0 || guide.landlordResponsibilities.length > 0 ? (
          <ResultSection id="responsibilities" title="Responsibilities">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-[15px] font-semibold text-ink">You</h3>
                <div className="mt-4">
                  <ResponsibilityList items={guide.tenantResponsibilities} />
                </div>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">Other party</h3>
                <div className="mt-4">
                  <ResponsibilityList items={guide.landlordResponsibilities} />
                </div>
              </div>
            </div>
          </ResultSection>
        ) : null}

        {otherClauses.length > 0 ? (
          <ResultSection
            id="clauses"
            title="Important clauses"
            intro="These clauses may affect your cost, responsibilities or decision."
          >
            <div>
              {otherClauses.map((clause) => (
                <LeaseClause key={clause.id} clause={clause} />
              ))}
            </div>
          </ResultSection>
        ) : null}

        {endingClauses.length > 0 || endingTerms.length > 0 ? (
          <ResultSection
            id="ending"
            title="Ending the agreement"
            intro="The result below only uses termination, cancellation, settlement, return or notice terms safely identified in this agreement."
          >
            {endingTerms.length > 0 ? (
              <div className="mb-5">
                <FactRows rows={endingTerms.map((item) => ({ label: item.label, value: item.value }))} />
              </div>
            ) : null}
            <div>
              {endingClauses.map((clause) => (
                <LeaseClause key={clause.id} clause={clause} />
              ))}
            </div>
          </ResultSection>
        ) : null}

        {problemClauses.length > 0 ? (
          <ResultSection
            id="problems"
            title="If things go wrong"
            intro="These are the clauses that deal with default, breach, late payment, enforcement or similar problems."
          >
            <div>
              {problemClauses.map((clause) => (
                <LeaseClause key={clause.id} clause={clause} />
              ))}
            </div>
          </ResultSection>
        ) : null}

        {hasProtections ? (
          <ResultSection
            id="protections"
            title="Legal protections"
            intro="Document facts and checked legal guidance are kept separate."
          >
            {result.yourRights.length > 0 ? (
              <div className="space-y-5">
                {result.yourRights.map((right) => (
                  <div key={right.id} className="border-l-2 border-teal/30 pl-4">
                    <h3 className="text-[14.5px] font-semibold text-ink">{right.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-6 text-ink-soft">{right.explanation}</p>
                    {right.legalBasis ? (
                      <p className="mt-2 text-[12px] leading-5 text-ink-soft">{right.legalBasis}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {guide.legalNotes.length > 0 ? (
              <div className="mt-6 rounded-[14px] border border-line bg-paper px-4 py-4">
                <div className="flex gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                  <ul className="space-y-2">
                    {guide.legalNotes.map((note) => (
                      <li key={note} className="text-[13px] leading-5 text-ink-soft">{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {guide.guidanceSources.length > 0 ? (
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Guidance sources
                </p>
                <div className="mt-3 space-y-2">
                  {guide.guidanceSources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[13.5px] font-medium text-teal underline decoration-teal/30 underline-offset-2"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </ResultSection>
        ) : null}

        {hasEvidence ? (
          <ResultSection
            id="evidence"
            title="Evidence"
            intro="Use this section to see the wording or checked rule context behind important points."
          >
            <div>
              {guide.clausesToCheck
                .filter((clause) => clause.leaseText || clause.legalBasis)
                .map((clause) => (
                  <EvidenceDisclosure
                    key={clause.id}
                    source={documentLabel}
                    location={clause.title}
                    excerpt={clause.leaseText || "No direct agreement quote was retained for this point."}
                    meaning={clause.explanation}
                  />
                ))}
            </div>
          </ResultSection>
        ) : null}

        {result.ask?.supported === true ? (
          <ResultSection
            id="ask"
            title="Ask LeaseCheck"
            intro="Ask a follow-up question grounded in this document and approved rules."
          >
            <LeaseAskSection documentId={documentId} capability={result.ask} />
          </ResultSection>
        ) : null}

        <div className="border-t border-line pt-6">
          <p className="text-[11.5px] leading-5 text-ink-soft">{result.disclaimer.wording}</p>
        </div>
      </div>
    </ResultWorkspace>
  );
}
