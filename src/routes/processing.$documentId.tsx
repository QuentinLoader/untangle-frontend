import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  fetchDocumentStatus,
  friendlyDocumentError,
  isTerminalProcessingStatus,
  processingCopy,
  type DocumentProcessingStatus,
} from "@/lib/documents";

export const Route = createFileRoute("/processing/$documentId")({
  head: () => ({
    meta: [
      { title: "Reading your document — Untangle" },
      {
        name: "description",
        content: "Untangle is reading your document and extracting what matters.",
      },
      { property: "og:title", content: "Reading your document — Untangle" },
      {
        property: "og:description",
        content: "Untangle is reading your document and extracting what matters.",
      },
    ],
  }),
  component: withAuth(Processing),
});

const STEPS: { label: string; statuses: DocumentProcessingStatus[] }[] = [
  { label: "Identifying document type", statuses: ["DETECTING_MODULE", "CLASSIFYING"] },
  { label: "Extracting key dates & amounts", statuses: ["EXTRACTING", "VALIDATING_RESULT"] },
  { label: "Checking your rights", statuses: ["MATCHING_RULES"] },
];

/** Number of consecutive polling failures tolerated before surfacing an error. */
const MAX_CONSECUTIVE_POLL_FAILURES = 3;

function Processing() {
  const { documentId } = Route.useParams();
  const [status, setStatus] = useState<DocumentProcessingStatus | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    const poll = async () => {
      try {
        const result = await fetchDocumentStatus(documentId);
        if (stoppedRef.current) return;
        failures = 0;
        const next = result.data.document.processingStatus;
        setStatus(next);
        setQueryError(null);
        if (isTerminalProcessingStatus(next)) {
          stoppedRef.current = true;
          return;
        }
      } catch (err) {
        if (stoppedRef.current) return;
        failures += 1;
        // Keep the last known good status; only surface persistent failures.
        if (failures >= MAX_CONSECUTIVE_POLL_FAILURES) {
          setQueryError(friendlyDocumentError(err));
        }
      }
      timer = setTimeout(() => void poll(), 3000);
    };

    void poll();

    return () => {
      stoppedRef.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [documentId]);

  const isLoading = status === null;
  const backendFailed = status === "FAILED" || status === "CANCELLED";
  const showProcessingError = backendFailed || queryError !== null;

  const copy = status
    ? processingCopy(status)
    : { title: "Checking document status…", body: "One moment while we look this up." };

  const order: DocumentProcessingStatus[] = [
    "QUEUED",
    "DETECTING_MODULE",
    "CLASSIFYING",
    "EXTRACTING",
    "VALIDATING_RESULT",
    "MATCHING_RULES",
    "COMPLETED",
  ];
  const currentIndex = status ? order.indexOf(status) : -1;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-7">
        <header className="flex items-center justify-center pt-2">
          <h1 className="font-display text-[17px] font-semibold text-ink">Reading your document</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center pb-16">
          <div className="flex h-[100px] w-[82px] flex-col justify-start gap-2 rounded-lg border-2 border-ink bg-card p-3 pt-4">
            <div className="h-[5px] w-full rounded-full bg-paper-2" />
            <div className="h-[5px] w-[75%] rounded-full bg-teal/40" />
            <div className="h-[5px] w-[55%] rounded-full bg-paper-2" />
          </div>

          <h2 className="mt-8 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
            {copy.body}
          </p>
          {!isLoading && (
            <p
              className={`mt-3 font-mono text-[10.5px] font-bold uppercase tracking-wide ${
                backendFailed ? "text-stamp-red" : "text-teal"
              }`}
            >
              {status}
            </p>
          )}

          <div className="mt-10 w-full max-w-[260px] space-y-4">
            {STEPS.map((step) => {
              const stepIndex = Math.max(...step.statuses.map((s) => order.indexOf(s)));
              return (
                <StepRow
                  key={step.label}
                  label={step.label}
                  done={currentIndex > stepIndex && currentIndex >= 0}
                />
              );
            })}
          </div>

          {showProcessingError && (
            <p className="mt-6 max-w-[280px] text-center text-[13px] text-stamp-red" role="alert">
              {backendFailed
                ? copy.body
                : (queryError ?? "We could not check this document. Please try again.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <div
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
          done ? "border-teal bg-teal" : "border-teal bg-transparent"
        }`}
      >
        {done && <span className="text-[13px] font-bold text-white">✓</span>}
      </div>
      <span
        className={`text-[14px] transition-colors duration-300 ${
          done ? "font-medium text-ink" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
