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
  Clock3,
  FileText,
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
      { title: "TaxSnap result — Untangle" },
      {
        name: "description",
        content: "Your SARS document explained in plain English with the actions, dates and rights that matter.",
      },
      { property: "og:title", content: "TaxSnap result — Untangle" },
      {
        property: "og:description",
        content: "Your SARS document explained in plain English with the actions, dates and rights that matter.",
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
              {result?.document.moduleDisplayName ?? "TaxSnap"}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
        {documentId === "" ? (
          <StateMessage
            title="We could not find this result"
            body="Open the document again from your vault to view its result."
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

function ResultBody({ result }: { result: DocumentResult }) {
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
  const timeLimits = result.timeLimits ?? [];
  const hasConfidenceWarning =
    document.confidence === "MEDIUM" ||
    document.confidence === "LOW" ||
    validationWarnings.length > 0;
  const hasExactReminder = result.reminderCandidates.length > 0;

  return (
    <div className="space-y-3">
      <section className="rounded-[18px] border border-line bg-white p-4 shadow-[0_1px_0_rgba(31,42,36,0.03)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel>What happened</SectionLabel>
            <h2 className="mt-2 font-display text-[23px] font-semibold leading-[1.15] text-ink">
              {summary.headline}
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

        {(document.documentTitle || document.issueDate) && (
          <div className="mt-4 border-t border-dashed border-line pt-3">
            {document.documentTitle && (
              <p className="text-[12px] font-semibold leading-snug text-ink">
                {document.documentTitle}
              </p>
            )}
            {document.issueDate && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-soft">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Issued {formatResultDate(document.issueDate)}
              </p>
            )}
          </div>
        )}
      </section>

      {requiredActions.length > 0 && (
        <BlockCard title="What you need to do" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {requiredActions.map((action, index) => (
              <div
                key={action.id}
                className="flex gap-3 rounded-[14px] bg-paper px-3 py-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-[12px] font-bold text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[13.5px] font-semibold leading-snug text-ink">
                    {action.action}
                  </p>
                  {action.details && (
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                      {action.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </BlockCard>
      )}

      <BlockCard title="Important dates" className="!rounded-[18px] !p-4">
        {keyDates.length === 0 && timeLimits.length === 0 ? (
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-ink-soft">
              This document does not contain an exact action date that Untangle can safely use as a deadline.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keyDates.map((keyDate) => (
              <div key={keyDate.id} className="flex items-start justify-between gap-3 rounded-[12px] bg-paper px-3 py-2.5">
                <div className="flex min-w-0 items-start gap-2.5">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <div>
                    <p className="text-[12.5px] font-semibold leading-snug text-ink">{keyDate.label}</p>
                    {!keyDate.reminderRecommended && (
                      <p className="mt-0.5 text-[10.5px] text-ink-soft">Important date — not treated as a due date</p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.03em] text-ink">
                  {formatResultDate(keyDate.date)}
                </span>
              </div>
            ))}

            {timeLimits.map((timeLimit) => (
              <div key={timeLimit.id} className="rounded-[12px] border border-stamp-amber/30 bg-tint-sand px-3 py-3">
                <div className="flex items-start gap-2.5">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-stamp-amber" aria-hidden="true" />
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink">{timeLimit.label}</p>
                    <p className="mt-0.5 font-mono text-[12px] font-bold text-ink">{timeLimit.periodText}</p>
                    {timeLimit.caution && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">{timeLimit.caution}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/reminder"
          search={{ documentId: document.id }}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-line px-4 py-3 text-center text-[14px] font-semibold text-ink transition-colors active:bg-paper-2"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {hasExactReminder ? "Set a reminder" : "Add a reminder manually"}
        </Link>
      </BlockCard>

      {yourRights.length > 0 && (
        <BlockCard title="Your rights & options" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {yourRights.map((right) => (
              <div key={right.id} className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-semibold leading-snug text-ink">{right.right}</p>
                  {right.howToExercise && (
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{right.howToExercise}</p>
                  )}
                  {right.legalBasis && (
                    <p className="mt-1.5 text-[10px] leading-relaxed text-ink-soft">{right.legalBasis}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </BlockCard>
      )}

      {riskFlags.length > 0 && (
        <BlockCard title="If you ignore this" className="!rounded-[18px] !p-4">
          <div className="space-y-3">
            {riskFlags.map((flag) => (
              <div key={flag.id} className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-stamp-amber" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-semibold leading-snug text-ink">{flag.flag}</p>
                  {flag.explanation?.trim() && flag.explanation.trim() !== flag.flag.trim() && (
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{flag.explanation}</p>
                  )}
                  {flag.legalBasis && (
                    <p className="mt-1.5 text-[10px] leading-relaxed text-ink-soft">{flag.legalBasis}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </BlockCard>
      )}

      {amounts.length > 0 && (
        <BlockCard title="Amounts" className="!rounded-[18px] !p-4">
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
      )}

      {hasConfidenceWarning && (
        <div className="rounded-[16px] border border-stamp-amber/35 bg-tint-sand p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-stamp-amber" aria-hidden="true" />
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Check before you act</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                Untangle could not confirm every detail with high confidence. Compare important dates, amounts and reference numbers with the original document.
              </p>
            </div>
          </div>
        </div>
      )}

      {result.escalation.recommended && (
        <div className="rounded-[16px] border border-line bg-white p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Consider professional help</p>
              {result.escalation.suggestedProfessional === "tax_practitioner" && (
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                  A SARS-registered tax practitioner or accountant can help you confirm the next step before you act.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <details className="group rounded-[16px] border border-line bg-white">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[13px] font-semibold text-ink">
          Document details
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-line px-4 py-4 text-[11.5px] leading-relaxed text-ink-soft">
          <dl className="space-y-2">
            <div className="flex justify-between gap-4">
              <dt>Tax area</dt>
              <dd className="text-right font-medium text-ink">{document.taxType.replaceAll("_", " ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Confidence</dt>
              <dd className="text-right font-medium text-ink">{document.confidence ?? "Not available"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Document type</dt>
              <dd className="max-w-[60%] text-right font-medium text-ink">{document.taxonomyDocumentType.replaceAll("_", " ")}</dd>
            </div>
          </dl>

          {validationWarnings.length > 0 && (
            <div className="mt-4 border-t border-dashed border-line pt-3">
              <p className="font-semibold text-ink">Validation notes</p>
              <ul className="mt-1.5 space-y-1">
                {validationWarnings.slice(0, 5).map((warning) => (
                  <li key={`${warning.fieldKey}-${warning.code}`}>
                    • {warning.fieldKey.replaceAll("_", " ").toLowerCase()} needs a quick check.
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 border-t border-dashed border-line pt-3">
            <p>{result.disclaimer.wording}</p>
          </div>
        </div>
      </details>
    </div>
  );
}
