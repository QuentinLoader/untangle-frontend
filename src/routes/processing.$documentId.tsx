import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileQuestion, FileText, Globe, Search } from "lucide-react";
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
  { label: "Reading document", statuses: ["QUEUED"] },
  { label: "Identifying important information", statuses: ["DETECTING_MODULE", "CLASSIFYING"] },
  { label: "Understanding the terms", statuses: ["EXTRACTING"] },
  {
    label: "Checking important clauses",
    statuses: ["VALIDATING_RESULT", "MATCHING_RULES"],
  },
  { label: "Preparing your answer", statuses: ["COMPLETED"] },
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const stoppedRef = useRef(false);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

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
          <h1 className="font-display text-[17px] font-semibold text-ink">
            Analysing your document
          </h1>
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
              <ActivityRing active={!backendFailed} />

              <h2
                className="mt-7 text-center font-display text-[22px] font-semibold leading-snug text-ink"
                aria-live="polite"
              >
                {copy.title}
              </h2>
              <p className="mt-2 max-w-[300px] text-center text-[13.5px] leading-relaxed text-ink-soft">
                {copy.body}
              </p>
              {!backendFailed && !isLoading && (
                <div className="mt-3 flex flex-col items-center gap-2 text-center">
                  <div
                    className="inline-flex min-h-7 items-center gap-2 rounded-full bg-teal/10 px-3 text-[12px] font-medium text-teal"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-50 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                    </span>
                    {formatElapsedTime(elapsedSeconds)}
                  </div>
                  <p className="max-w-[300px] text-[12px] leading-relaxed text-ink-soft">
                    Keep this screen open. Your result will appear as soon as it is ready.
                  </p>
                  {elapsedSeconds >= 45 && (
                    <p className="max-w-[300px] text-[12px] leading-relaxed text-ink-soft">
                      Detailed documents can take a little longer. Analysis is continuing normally.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-9 w-full max-w-[300px] space-y-4">
                {STEPS.map((step) => {
                  const indices = step.statuses.map((s) => order.indexOf(s));
                  const stepIndex = Math.max(...indices);
                  const stepMinIndex = Math.min(...indices);
                  const done = currentIndex > stepIndex && currentIndex >= 0;
                  const active =
                    !done &&
                    currentIndex >= stepMinIndex &&
                    currentIndex <= stepIndex &&
                    currentIndex >= 0;
                  return (
                    <StepRow key={step.label} label={step.label} done={done} active={active} />
                  );
                })}
              </div>

              {!backendFailed && !isLoading && (
                <p className="mt-7 max-w-[300px] text-center text-[12px] leading-relaxed text-ink-soft">
                  Your document is processed securely and only you can see it.{" "}
                  <Link to="/terms" className="font-medium text-teal underline underline-offset-2">
                    Terms &amp; privacy
                  </Link>
                </p>
              )}

              {showProcessingError && (
                <p
                  className="mt-6 max-w-[280px] text-center text-[13px] text-stamp-red"
                  role="alert"
                >
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

function NeedsReviewNav() {
  return (
    <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3">
      <Link
        to="/"
        className="flex h-12 items-center justify-center rounded-full bg-teal text-[15px] font-semibold text-white transition-opacity active:opacity-80"
      >
        Back to Home
      </Link>
      <Link
        to="/upload"
        className="flex h-12 items-center justify-center rounded-full border border-line bg-white text-[15px] font-semibold text-ink transition-colors active:bg-paper-2"
      >
        Upload another document
      </Link>
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
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-stamp-amber">
            <FileText size={26} strokeWidth={1.8} aria-hidden />
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
          <NeedsReviewNav />
        </div>
      );
    case "MODULE_NOT_ACTIVE":
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-teal/10 text-teal">
            <Search size={26} strokeWidth={1.8} aria-hidden />
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
          <NeedsReviewNav />
        </div>
      );
    case "JURISDICTION_NOT_SUPPORTED":
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-stamp-amber">
            <Globe size={26} strokeWidth={1.8} aria-hidden />
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
          <NeedsReviewNav />
        </div>
      );
    case "MODULE_DETECTION_LOW_CONFIDENCE":
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-stamp-amber">
            <FileQuestion size={26} strokeWidth={1.8} aria-hidden />
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
          <NeedsReviewNav />
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-stamp-amber/15 text-stamp-amber">
            <FileText size={26} strokeWidth={1.8} aria-hidden />
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
          <NeedsReviewNav />
        </div>
      );
  }
}

function formatElapsedTime(seconds: number) {
  if (seconds < 60) return `${seconds}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${minutes} min ${secs} s elapsed`;
}

/** Continuous activity indicator — intentionally does not imply measured progress. */
function ActivityRing({ active }: { active: boolean }) {
  return (
    <div className="relative grid h-[136px] w-[136px] place-items-center">
      <svg
        viewBox="0 0 120 120"
        className={`h-full w-full -rotate-90 ${active ? "animate-spin motion-reduce:animate-none" : ""}`}
        style={{ animationDuration: "1.8s" }}
        aria-hidden
      >
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--paper-2)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--teal)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="245 327"
        />
      </svg>
    </div>
  );
}

function StepRow({ label, done, active }: { label: string; done: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <div
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
          done
            ? "border-teal bg-teal"
            : active
              ? "animate-pulse border-teal bg-teal/10"
              : "border-teal bg-transparent"
        }`}
      >
        {done && <span className="text-[13px] font-bold text-white">✓</span>}
        {!done && active && <span className="h-2 w-2 rounded-full bg-teal" />}
      </div>
      <span
        className={`text-[14px] transition-colors duration-300 ${
          done ? "font-medium text-ink" : active ? "font-medium text-ink" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
