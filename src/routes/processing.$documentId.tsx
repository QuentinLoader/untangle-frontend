import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  getDocumentStatus,
  friendlyDocumentError,
  isTerminalProcessingStatus,
  processingCopy,
  toTitleCase,
  type DocumentFailureCode,
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
  const navigate = useNavigate();
  const [status, setStatus] = useState<DocumentProcessingStatus | null>(null);
  const [detectedDocumentType, setDetectedDocumentType] = useState<string | null>(null);
  const [failureCode, setFailureCode] = useState<DocumentFailureCode | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    const poll = async () => {
      try {
        const response = await getDocumentStatus(documentId);
        if (stoppedRef.current) return;
        failures = 0;
        const docStatus = response.data.status;
        const next = docStatus.processingStatus;
        setStatus(next);
        setDetectedDocumentType(docStatus.detectedDocumentType ?? null);
        setFailureCode((docStatus.failureCode as DocumentFailureCode | null) ?? null);
        setFailureMessage(docStatus.failureMessage ?? null);
        setQueryError(null);
        if (isTerminalProcessingStatus(next)) {
          stoppedRef.current = true;
          if (next === "COMPLETED") {
            void navigate({ to: "/result", search: { documentId, from: "upload" as const } });
          }
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
  }, [documentId, navigate]);

  const isLoading = status === null;
  const needsReview = status === "NEEDS_REVIEW";
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
          {needsReview ? (
            <NeedsReviewState
              failureCode={failureCode}
              detectedDocumentType={detectedDocumentType}
              failureMessage={failureMessage}
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NeedsReviewState({
  failureCode,
  detectedDocumentType,
  failureMessage,
}: {
  failureCode: DocumentFailureCode | null;
  detectedDocumentType: string | null;
  failureMessage: string | null;
}) {
  const readableDocumentType = detectedDocumentType ? toTitleCase(detectedDocumentType) : null;

  switch (failureCode) {
    case "DOCUMENT_NOT_SUPPORTED":
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-[28px]">
            📄
          </div>
          <h2 className="mt-6 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            This document isn't supported yet
          </h2>
          {readableDocumentType && (
            <p className="mt-4 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
              Untangle identified it as:
              <br />
              <span className="font-medium text-ink">{readableDocumentType}</span>
            </p>
          )}
          <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
            Untangle currently supports TaxSnap documents in this version.
          </p>
          {failureMessage && (
            <p className="mt-6 max-w-[280px] text-center text-[12px] text-ink-soft" role="status">
              {failureMessage}
            </p>
          )}
        </div>
      );
    case "MODULE_NOT_ACTIVE":
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-teal/10 text-[28px]">
            🔍
          </div>
          <h2 className="mt-6 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            We recognised this document
          </h2>
          <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
            This Untangle module isn't available yet.
          </p>
          {failureMessage && (
            <p className="mt-6 max-w-[280px] text-center text-[12px] text-ink-soft" role="status">
              {failureMessage}
            </p>
          )}
        </div>
      );
    case "JURISDICTION_NOT_SUPPORTED":
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-[28px]">
            🌍
          </div>
          <h2 className="mt-6 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            This document is outside the current TaxSnap scope
          </h2>
          <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
            Untangle currently supports South African tax documents.
          </p>
          {failureMessage && (
            <p className="mt-6 max-w-[280px] text-center text-[12px] text-ink-soft" role="status">
              {failureMessage}
            </p>
          )}
        </div>
      );
    case "MODULE_DETECTION_LOW_CONFIDENCE":
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-[28px]">
            ❓
          </div>
          <h2 className="mt-6 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            We couldn't identify this document confidently
          </h2>
          <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
            Please check the document and try again.
          </p>
          {failureMessage && (
            <p className="mt-6 max-w-[280px] text-center text-[12px] text-ink-soft" role="status">
              {failureMessage}
            </p>
          )}
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-[28px]">
            📄
          </div>
          <h2 className="mt-6 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            This one needs a closer look
          </h2>
          <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
            Some details could not be confirmed automatically.
          </p>
          {failureMessage && (
            <p className="mt-6 max-w-[280px] text-center text-[12px] text-ink-soft" role="status">
              {failureMessage}
            </p>
          )}
        </div>
      );
  }
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
