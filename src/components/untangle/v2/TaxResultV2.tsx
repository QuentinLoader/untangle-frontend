import { AlertTriangle, CalendarDays, FileText, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
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
  formatResultDate,
  type TaxDocumentResult,
} from "@/lib/documents";

type BackTarget = { to: string; label: string };

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

function warningFieldLabel(fieldKey: string): string {
  return fieldKey.replaceAll("_", " ").toLowerCase();
}

function ContextRail({
  result,
  documentId,
}: {
  result: TaxDocumentResult;
  documentId: string;
}) {
  const warnings = result.validationWarnings ?? [];
  const reminder = result.reminderCandidates[0];

  return (
    <>
      <div className="rounded-[14px] border border-line bg-white p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Document</p>
            <p className="mt-1 text-[14px] font-semibold leading-5 text-ink">
              {result.document.documentTitle || result.humanGuide?.whatThisIs || result.summary.headline}
            </p>
            <p className="mt-1 text-[12px] leading-5 text-ink-soft">{friendlyTaxArea(result)}</p>
            {result.document.confidence ? (
              <p className="mt-2 text-[12px] text-ink-soft">
                Confidence: <span className="font-semibold text-ink">{result.document.confidence.toLowerCase()}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {warnings.length > 0 || result.document.confidence === "LOW" || result.document.confidence === "MEDIUM" ? (
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-amber-900">Check this</p>
              <p className="mt-1 text-[13.5px] font-semibold leading-5 text-ink">
                Compare important details with the original notice.
              </p>
              {warnings.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {warnings.slice(0, 3).map((warning) => (
                    <li key={warning.fieldKey + warning.code} className="text-[12px] leading-5 text-ink-soft">
                      {warningFieldLabel(warning.fieldKey)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {reminder ? (
        <Link
          to="/reminder"
          search={{ documentId }}
          className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4 transition-colors hover:bg-paper-2"
        >
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">Set a reminder</span>
            <span className="mt-1 block text-[12px] leading-5 text-ink-soft">
              {reminder.label}: {formatResultDate(reminder.dueDate)}
            </span>
          </span>
        </Link>
      ) : null}
    </>
  );
}

export function TaxResultV2({
  result,
  documentId,
  back,
}: {
  result: TaxDocumentResult;
  documentId: string;
  back: BackTarget;
}) {
  const guide = result.humanGuide;
  const reminder = result.reminderCandidates[0];
  const actions = guide?.nextSteps?.length
    ? guide.nextSteps
    : result.requiredActions.map((action) => ({
        id: action.id,
        title: action.action,
        detail: action.details,
        where: null,
        optional: action.priority !== "HIGH",
      }));
  const requiredItems = guide?.requiredItems ?? [];
  const guidanceSources = guide?.guidanceSources ?? [];
  const timeLimits = result.timeLimits ?? [];

  const metrics: Array<{ label: string; value: string; note?: string }> = [];

  if (reminder) {
    metrics.push({
      label: reminder.label || "Important date",
      value: formatResultDate(reminder.dueDate),
      note: "Deadline confirmed in the validated result.",
    });
  } else if (result.keyDates[0]) {
    metrics.push({
      label: result.keyDates[0].label,
      value: formatResultDate(result.keyDates[0].date),
      note: "Date shown in the document; confirm whether it is the action deadline.",
    });
  }

  if (result.amounts[0]) {
    metrics.push({
      label: result.amounts[0].label,
      value: formatResultAmount(result.amounts[0].amountCents, result.amounts[0].currency),
      note: result.amounts[0].isEstimate ? "Shown as an estimate in the validated result." : undefined,
    });
  }

  metrics.push({ label: "Tax area", value: friendlyTaxArea(result) });

  if (result.document.issueDate) {
    metrics.push({ label: "Issued", value: formatResultDate(result.document.issueDate) });
  }

  const navItems: WorkspaceNavItem[] = [
    { id: "summary", label: "Summary" },
    { id: "meaning", label: "What this means" },
    ...(guide?.whatSarsWants || actions.length > 0 ? [{ id: "actions", label: "What to do" }] : []),
    ...(result.keyDates.length > 0 || timeLimits.length > 0 || result.amounts.length > 0
      ? [{ id: "dates", label: "Dates & amounts" }]
      : []),
    ...(result.riskFlags.length > 0 ? [{ id: "risks", label: "If you ignore it" }] : []),
    ...(result.yourRights.length > 0 ? [{ id: "rights", label: "Rights & options" }] : []),
    ...(guidanceSources.length > 0 || requiredItems.length > 0 || guide?.sourceGap
      ? [{ id: "sources", label: "Sources & checks" }]
      : []),
  ];

  const documentLabel =
    result.document.documentTitle ||
    guide?.whatThisIs ||
    result.document.detectedDocumentType ||
    "SARS document";

  return (
    <ResultWorkspace
      productName="TaxSnap"
      portfolioLabel="Part of Untangle South Africa"
      documentLabel={documentLabel}
      navItems={navItems}
      context={<ContextRail result={result} documentId={documentId} />}
      backTo={back.to}
      backLabel={"Back to " + back.label}
      statusLabel="Analysis complete"
    >
      <div className="space-y-10">
        <ResultSection id="summary" title={guide?.whatThisIs || result.summary.headline}>
          <div className="flex flex-wrap gap-2">
            <StatusBadge>{friendlyTaxArea(result)}</StatusBadge>
            {result.summary.severity === "CRITICAL" || result.summary.severity === "URGENT" ? (
              <StatusBadge tone="critical">{result.summary.severity === "CRITICAL" ? "Critical" : "Urgent"}</StatusBadge>
            ) : result.summary.severity === "ACTION_NEEDED" ? (
              <StatusBadge tone="attention">Action needed</StatusBadge>
            ) : null}
          </div>

          <p className="mt-5 text-[16px] leading-7 text-ink-soft">
            {guide?.whatItMeans || result.summary.plainEnglish}
          </p>

          {guide?.context ? (
            <div className="mt-5 border-l-2 border-teal/30 pl-4">
              <p className="text-[13.5px] leading-6 text-ink-soft">{guide.context}</p>
            </div>
          ) : null}

          {metrics.length > 0 ? (
            <div className="mt-6 border-y border-line lg:grid lg:grid-cols-2 xl:grid-cols-4">
              {metrics.slice(0, 4).map((metric) => (
                <KeyMetric
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  note={metric.note}
                />
              ))}
            </div>
          ) : null}

          {actions[0] ? (
            <div className="mt-7 rounded-[14px] border border-line bg-paper px-4 py-4">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">What to do next</p>
              <p className="mt-2 text-[15px] font-semibold leading-6 text-ink">{actions[0].title}</p>
              {actions[0].detail ? (
                <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">{actions[0].detail}</p>
              ) : null}
            </div>
          ) : null}
        </ResultSection>

        <ResultSection
          id="meaning"
          title="What this means for you"
          intro="Untangle separates the meaning of the notice from the action SARS is asking you to take."
        >
          <MeaningBlock title="The practical meaning">
            <p>{guide?.whatItMeans || result.summary.plainEnglish}</p>
          </MeaningBlock>

          {guide?.deadline ? (
            <div className="mt-5">
              <MeaningBlock title="Deadline">
                <p>{guide.deadline}</p>
              </MeaningBlock>
            </div>
          ) : null}
        </ResultSection>

        {guide?.whatSarsWants || actions.length > 0 ? (
          <ResultSection
            id="actions"
            title="What SARS wants and what to do"
            intro="The most important actions come first. Optional steps stay clearly marked."
          >
            {guide?.whatSarsWants ? (
              <MeaningBlock title="What SARS wants">
                <p>{guide.whatSarsWants}</p>
              </MeaningBlock>
            ) : null}

            {actions.length > 0 ? (
              <ol className="mt-6 space-y-4">
                {actions.map((step, index) => (
                  <li key={step.id} className="grid grid-cols-[30px_minmax(0,1fr)] gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-teal text-[12px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14.5px] font-semibold leading-6 text-ink">{step.title}</p>
                        {step.optional ? (
                          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-soft">
                            If needed
                          </span>
                        ) : null}
                      </div>
                      {step.detail ? (
                        <p className="mt-1 text-[13.5px] leading-6 text-ink-soft">{step.detail}</p>
                      ) : null}
                      {step.where ? (
                        <p className="mt-2 flex items-start gap-1.5 text-[12.5px] font-medium leading-5 text-teal">
                          <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden />
                          {step.where}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}

            {guide?.whereToGo && !actions.some((step) => Boolean(step.where)) ? (
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-[13px] font-semibold text-ink">Where to respond</p>
                <p className="mt-1 text-[13.5px] leading-6 text-ink-soft">{guide.whereToGo}</p>
              </div>
            ) : null}
          </ResultSection>
        ) : null}

        {result.keyDates.length > 0 || timeLimits.length > 0 || result.amounts.length > 0 ? (
          <ResultSection
            id="dates"
            title="Dates & amounts"
            intro="Dates written in a notice are not automatically deadlines. TaxSnap keeps those distinctions visible."
          >
            {result.keyDates.length > 0 ? (
              <div>
                <h3 className="text-[14px] font-semibold text-ink">Dates in the document</h3>
                <FactRows
                  rows={result.keyDates.map((item) => ({
                    label: item.label,
                    value: formatResultDate(item.date),
                    note: item.reminderRecommended ? "Reminder recommended." : undefined,
                  }))}
                />
              </div>
            ) : null}

            {timeLimits.length > 0 ? (
              <div className={result.keyDates.length > 0 ? "mt-7" : ""}>
                <h3 className="text-[14px] font-semibold text-ink">Time periods</h3>
                <div className="mt-3 space-y-4">
                  {timeLimits.map((limit) => (
                    <div key={limit.id} className="border-l-2 border-line pl-4">
                      <p className="text-[14px] font-semibold text-ink">{limit.label}</p>
                      <p className="mt-1 text-[13.5px] leading-6 text-ink-soft">{limit.periodText}</p>
                      <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                        Exact deadline not calculated. {limit.caution || "Confirm when this period starts before relying on it."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {result.amounts.length > 0 ? (
              <div className={result.keyDates.length > 0 || timeLimits.length > 0 ? "mt-7" : ""}>
                <h3 className="text-[14px] font-semibold text-ink">Amounts</h3>
                <FactRows
                  rows={result.amounts.map((amount) => ({
                    label: amount.label,
                    value: formatResultAmount(amount.amountCents, amount.currency),
                    note: amount.isEstimate ? "Estimate." : undefined,
                  }))}
                />
              </div>
            ) : null}
          </ResultSection>
        ) : null}

        {result.riskFlags.length > 0 ? (
          <ResultSection
            id="risks"
            title="If you ignore it"
            intro="These consequences come from the validated result and are not added by the interface."
          >
            <div className="space-y-5">
              {result.riskFlags.map((flag) => (
                <div key={flag.id} className="border-l-4 border-stamp-amber bg-amber-50/70 px-4 py-4">
                  <div className="flex gap-3">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
                    <div>
                      <p className="text-[14.5px] font-semibold text-ink">{flag.flag}</p>
                      <p className="mt-1.5 text-[13.5px] leading-6 text-ink-soft">{flag.explanation}</p>
                      {flag.legalBasis ? (
                        <p className="mt-2 text-[12px] leading-5 text-ink-soft">{flag.legalBasis}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResultSection>
        ) : null}

        {result.yourRights.length > 0 ? (
          <ResultSection
            id="rights"
            title="Rights & options"
            intro="These are options or protections included in the validated result."
          >
            <div className="space-y-5">
              {result.yourRights.map((right) => (
                <div key={right.id} className="border-l-2 border-teal/30 pl-4">
                  <h3 className="text-[14.5px] font-semibold text-ink">{right.right}</h3>
                  {right.howToExercise ? (
                    <p className="mt-2 text-[13.5px] leading-6 text-ink-soft">{right.howToExercise}</p>
                  ) : null}
                  {right.legalBasis ? (
                    <p className="mt-2 text-[12px] leading-5 text-ink-soft">{right.legalBasis}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </ResultSection>
        ) : null}

        {guidanceSources.length > 0 || requiredItems.length > 0 || guide?.sourceGap ? (
          <ResultSection
            id="sources"
            title="Sources & checks"
            intro="TaxSnap keeps SARS guidance, required documents and unresolved gaps separate from the document summary."
          >
            {requiredItems.length > 0 ? (
              <div>
                <h3 className="text-[14px] font-semibold text-ink">What you may need</h3>
                <div className="mt-3 space-y-4">
                  {requiredItems.map((item) => (
                    <div key={item.id} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                      <p className="text-[14px] font-semibold text-ink">{item.name}</p>
                      {item.whatItIs ? (
                        <p className="mt-1 text-[13px] leading-5 text-ink-soft">{item.whatItIs}</p>
                      ) : null}
                      {item.whereToGet ? (
                        <p className="mt-1 text-[12.5px] leading-5 text-teal">{item.whereToGet}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {guide?.sourceGap ? (
              <div className={requiredItems.length > 0 ? "mt-6 border-t border-line pt-5" : ""}>
                <div className="flex gap-3">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink">Still needs checking</p>
                    <p className="mt-1 text-[13px] leading-5 text-ink-soft">{guide.sourceGap}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {guidanceSources.length > 0 ? (
              <div className={requiredItems.length > 0 || guide?.sourceGap ? "mt-6 border-t border-line pt-5" : ""}>
                <div className="flex gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-ink">SARS guidance used</p>
                    <div className="mt-2 space-y-2">
                      {guidanceSources.map((source) => (
                        <a
                          key={source.id}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-[13px] font-medium text-teal underline decoration-teal/30 underline-offset-2"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </ResultSection>
        ) : null}

        <div className="border-t border-line pt-6">
          <p className="text-[11.5px] leading-5 text-ink-soft">{result.disclaimer.wording}</p>
        </div>
      </div>
    </ResultWorkspace>
  );
}
