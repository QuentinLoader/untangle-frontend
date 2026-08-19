import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StampBadge, type StampColor } from "@/components/untangle/StampBadge";
import { BlockCard } from "@/components/untangle/BlockCard";
import { SecondaryButton } from "@/components/untangle/Buttons";
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
    const value = typeof search['documentId'] === "string" ? search['documentId'] : "";
    return {
      documentId: UUID_RE.test(value) ? value : "",
      from: parseResultOrigin(search['from']),
    };
  },

  head: () => ({
    meta: [
      { title: "TaxSnap result — Untangle" },
      {
        name: "description",
        content: "Your SARS letter explained in plain English with the key dates and actions.",
      },
      { property: "og:title", content: "TaxSnap result — Untangle" },
      {
        property: "og:description",
        content: "Your SARS letter explained in plain English with the key dates and actions.",
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
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-10 bg-paper px-5 pt-7 pb-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            to={back.to}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label={`Back to ${back.label}`}
          >
            <span className="text-[19px]">←</span>
          </Link>

          <h1 className="font-display text-[17px] font-semibold text-ink">
            {result?.document.moduleDisplayName ?? "Result"}
          </h1>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto px-5 pb-5">
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
    <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
      <h2 className="font-display text-[19px] font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function ResultBody({ result }: { result: DocumentResult }) {
  const { summary, document, requiredActions, keyDates, amounts, riskFlags, yourRights } = result;

  return (
    <>
      <div className="flex justify-end pt-1">
        <StampBadge
          label={severityLabel(summary.severity)}
          color={SEVERITY_COLOR[summary.severity]}
          className="rotate-[-5deg]"
        />
      </div>

      <h2 className="mt-2 font-display text-[20px] font-semibold leading-snug text-ink">
        {summary.headline}
      </h2>
      <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-soft">
        {summary.plainEnglish}
      </p>

      {(document.documentTitle || document.issueDate) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-soft">
          {document.documentTitle && (
            <span className="font-medium text-ink">{document.documentTitle}</span>
          )}
          {document.issueDate && (
            <span className="font-mono text-[10.5px] uppercase tracking-[0.04em]">
              {formatResultDate(document.issueDate)}
            </span>
          )}
        </div>
      )}

      {requiredActions.length > 0 && (
        <BlockCard title="What you need to do" className="mt-5">
          <div className="space-y-3">
            {requiredActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3">
                <div className="mt-0.5 h-[15px] w-[15px] shrink-0 rounded-[3px] border-2 border-ink-soft" />
                <div>
                  <p className="text-[12.5px] leading-snug text-ink">{action.action}</p>
                  {action.details && (
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                      {action.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </BlockCard>
      )}

      <BlockCard title="Key dates" className="mt-3">
        {keyDates.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            No explicit response, submission, or payment deadline was found in the validated facts
            from this document.
          </p>
        ) : (
          <div className="space-y-3">
            {keyDates.map((keyDate) => (
              <div key={keyDate.id} className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] font-semibold text-ink">{keyDate.label}</span>
                <span className="rounded-full bg-paper-2 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-ink">
                  {formatResultDate(keyDate.date)}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link
          to="/reminder"
          search={{ documentId: document.id }}
          className="mt-4 block w-full rounded-[14px] border-[1.5px] border-line px-4 py-[14px] text-center text-[15px] font-semibold text-ink transition-colors hover:bg-paper-2"
        >
          {result.reminderCandidates.length > 0 ? "Set a reminder" : "Add a reminder myself"}
        </Link>

      </BlockCard>


      {amounts.length > 0 && (
        <BlockCard title="Amounts" className="mt-3">
          <div className="space-y-3">
            {amounts.map((amount) => (
              <div key={amount.id} className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] font-semibold text-ink">{amount.label}</span>
                <span className="font-mono text-[12.5px] font-semibold text-ink">
                  {formatResultAmount(amount.amountCents, amount.currency)}
                </span>
              </div>
            ))}
          </div>
        </BlockCard>
      )}

      {riskFlags.length > 0 && (
        <BlockCard title="Worth knowing" className="mt-3">
          <div className="space-y-3 text-[12.5px] leading-relaxed text-ink-soft">
            {riskFlags.map((flag) => {
              const explanation = flag.explanation?.trim() ?? "";
              const showExplanation =
                explanation.length > 0 && explanation !== flag.flag.trim();
              return (
                <div key={flag.id}>
                  <p className="font-medium text-ink">{flag.flag}</p>
                  {showExplanation && <p className="mt-1">{explanation}</p>}
                  {flag.legalBasis && (
                    <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.04em]">
                      {flag.legalBasis}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </BlockCard>
      )}

      {yourRights.length > 0 && (
        <BlockCard title="Your rights" className="mt-3">
          <div className="space-y-3 text-[12.5px] leading-relaxed text-ink-soft">
            {yourRights.map((right) => (
              <div key={right.id}>
                <p className="font-medium text-ink">{right.right}</p>
                {right.howToExercise && <p className="mt-1">{right.howToExercise}</p>}
                {right.legalBasis && (
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.04em]">
                    {right.legalBasis}
                  </p>
                )}
              </div>
            ))}
          </div>
        </BlockCard>
      )}

      {result.escalation.recommended && (
        <BlockCard title="Getting help" className="mt-3">
          {result.escalation.reasons.length > 0 && (
            <ul className="mb-3 space-y-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              {result.escalation.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
          <SecondaryButton>Find a tax practitioner near me</SecondaryButton>
        </BlockCard>
      )}

      <div className="sticky bottom-0 mt-6 border-t border-dashed border-line bg-paper pt-4 pb-2">
        <p className="text-[10px] leading-relaxed text-ink-soft">{result.disclaimer.wording}</p>
      </div>
    </>
  );
}
