import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  FileQuestion,
  FileText,
  Globe,
  Search,
} from "lucide-react";
import {
  getDocumentStatus,
  friendlyDocumentError,
  isTerminalProcessingStatus,
  processingCopy,
  toTitleCase,
  type DocumentFailureCode,
  type DocumentProcessingStatus,
} from "@/lib/documents";
import { findSolution, type Solution } from "@/lib/solutions";

type ProcessingSearch = { solution?: string };

export const Route = createFileRoute("/processing/$documentId")({
  validateSearch: (search: Record<string, unknown>): ProcessingSearch => {
    const solution = typeof search["solution"] === "string" ? search["solution"] : undefined;
    return solution ? { solution } : {};
  },
  head: () => ({
    meta: [
      { title: "Reading your document — Untangle South Africa" },
      {
        name: "description",
        content: "Untangle South Africa is securely reading and checking your document.",
      },
    ],
  }),
  component: withAuth(Processing),
});

type Step = { label: string; statuses: DocumentProcessingStatus[] };

const GENERIC_STEPS: Step[] = [
  { label: "Reading the document", statuses: ["QUEUED"] },
  { label: "Identifying what it is", statuses: ["DETECTING_MODULE", "CLASSIFYING"] },
  { label: "Finding the important details", statuses: ["EXTRACTING"] },
  { label: "Checking the result", statuses: ["VALIDATING_RESULT", "MATCHING_RULES"] },
  { label: "Preparing your explanation", statuses: ["COMPLETED"] },
];

const TAX_STEPS: Step[] = [
  { label: "Preparing the SARS document", statuses: ["QUEUED"] },
  { label: "Identifying the notice or assessment", statuses: ["DETECTING_MODULE", "CLASSIFYING"] },
  { label: "Reading dates, amounts and requests", statuses: ["EXTRACTING"] },
  { label: "Checking the important details", statuses: ["VALIDATING_RESULT", "MATCHING_RULES"] },
  { label: "Preparing your TaxSnap answer", statuses: ["COMPLETED"] },
];

const LEASE_STEPS: Step[] = [
  { label: "Preparing the agreement", statuses: ["QUEUED"] },
  { label: "Identifying the agreement and document role", statuses: ["DETECTING_MODULE", "CLASSIFYING"] },
  { label: "Reading money, dates and responsibilities", statuses: ["EXTRACTING"] },
  { label: "Checking important terms and protections", statuses: ["VALIDATING_RESULT", "MATCHING_RULES"] },
  { label: "Preparing your LeaseCheck answer", statuses: ["COMPLETED"] },
];

const MAX_CONSECUTIVE_POLL_FAILURES = 3;

function solutionFromDetectedModule(module: string | null): Solution | undefined {
  if (module === "TAX") return findSolution("taxsnap");
  if (module === "LEASE") return findSolution("leasecheck");
  return undefined;
}

function stepsFor(solution?: Solution): Step[] {
  if (solution?.slug === "taxsnap") return TAX_STEPS;
  if (solution?.slug === "leasecheck") return LEASE_STEPS;
  return GENERIC_STEPS;
}

function copyFor(status: DocumentProcessingStatus | null, solution?: Solution) {
  if (!status) {
    return {
      title: "Checking your document…",
      body: "We’re confirming where it belongs before the specialist analysis begins.",
    };
  }

  if (solution?.slug === "taxsnap") {
    const taxCopy: Partial<Record<DocumentProcessingStatus, { title: string; body: string }>> = {
      QUEUED: {
        title: "Preparing your SARS document",
        body: "TaxSnap is getting the document ready.",
      },
      DETECTING_MODULE: {
        title: "Identifying the SARS document",
        body: "We’re working out what kind of letter, notice or assessment you received.",
      },
      CLASSIFYING: {
        title: "Checking the document type",
        body: "TaxSnap is placing it in the right tax category.",
      },
      EXTRACTING: {
        title: "Reading what matters",
        body: "We’re finding important dates, amounts and requests.",
      },
      VALIDATING_RESULT: {
        title: "Checking the important details",
        body: "TaxSnap is validating the information before showing it to you.",
      },
      MATCHING_RULES: {
        title: "Checking what the notice requires",
        body: "The result is being checked against the approved guidance used by TaxSnap.",
      },
      COMPLETED: {
        title: "Your TaxSnap result is ready",
        body: "Opening the plain-language explanation now.",
      },
    };
    return taxCopy[status] ?? processingCopy(status);
  }

  if (solution?.slug === "leasecheck") {
    const leaseCopy: Partial<Record<DocumentProcessingStatus, { title: string; body: string }>> = {
      QUEUED: {
        title: "Preparing your agreement",
        body: "LeaseCheck is getting the document ready.",
      },
      DETECTING_MODULE: {
        title: "Identifying the agreement",
        body: "We’re working out what type of agreement or related document this is.",
      },
      CLASSIFYING: {
        title: "Understanding the document’s role",
        body: "LeaseCheck is checking whether this is the main agreement, a change or a later notice.",
      },
      EXTRACTING: {
        title: "Reading the terms that matter",
        body: "We’re finding money, dates, responsibilities and important clauses.",
      },
      VALIDATING_RESULT: {
        title: "Checking the important terms",
        body: "LeaseCheck is validating the information before explaining it.",
      },
      MATCHING_RULES: {
        title: "Checking applicable protections",
        body: "Approved guidance is applied only where the agreement type and facts support it.",
      },
      COMPLETED: {
        title: "Your LeaseCheck result is ready",
        body: "Opening the plain-language explanation now.",
      },
    };
    return leaseCopy[status] ?? processingCopy(status);
  }

  return processingCopy(status);
}

function Processing() {
  const { documentId } = Route.useParams();
  const { solution: requestedSolutionSlug } = Route.useSearch();
  const navigate = useNavigate();

  const [status, setStatus] = useState<DocumentProcessingStatus | null>(null);
  const [detectedModule, setDetectedModule] = useState<string | null>(null);
  const [detectedDocumentType, setDetectedDocumentType] = useState<string | null>(null);
  const [failureCode, setFailureCode] = useState<DocumentFailureCode | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const stoppedRef = useRef(false);

  const requestedSolution = requestedSolutionSlug ? findSolution(requestedSolutionSlug) : undefined;
  const detectedSolution = solutionFromDetectedModule(detectedModule);
  const solution = detectedSolution ?? requestedSolution;
  const steps = stepsFor(solution);
  const copy = copyFor(status, solution);

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
        setDetectedModule(docStatus.detectedModule ?? null);
        setDetectedDocumentType(docStatus.detectedDocumentType ?? null);
        setFailureCode((docStatus.failureCode as DocumentFailureCode | null) ?? null);
        setFailureMessage(docStatus.failureMessage ?? null);
        setQueryError(null);

        if (isTerminalProcessingStatus(next)) {
          stoppedRef.current = true;
          if (next === "COMPLETED") {
            void navigate({
              to: "/result",
              search: { documentId, from: "upload" as const },
            });
          }
          return;
        }
      } catch (err) {
        if (stoppedRef.current) return;
        failures += 1;
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
  const SpecialistIcon = solution?.icon ?? FileText;
  const isTax = solution?.slug === "taxsnap";
  const accent = isTax ? "var(--stamp-red)" : "var(--teal)";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line/80 bg-paper">
        <div className="mx-auto flex min-h-[72px] max-w-[860px] items-center gap-3 px-4 sm:px-6">
          <Link
            to="/home"
            aria-label="Back to Home"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-white"
          >
            <ArrowLeft size={19} aria-hidden />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink">
              {solution?.name ?? "Untangle South Africa"}
            </p>
            {solution ? (
              <p className="truncate text-[11.5px] text-ink-soft">Part of Untangle South Africa</p>
            ) : null}
          </div>
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: solution?.tint ?? "var(--paper-2)", color: accent }}
            aria-hidden
          >
            <SpecialistIcon size={18} strokeWidth={1.9} />
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[860px] px-5 py-8 sm:px-7 sm:py-10">
        {needsReview ? (
          <NeedsReviewState
            failureCode={failureCode}
            detectedDocumentType={detectedDocumentType}
            failureMessage={failureMessage}
            solutionSlug={solution?.slug}
          />
        ) : (
          <>
            <div className="border-l-[3px] pl-4 sm:pl-5" style={{ borderLeftColor: accent }}>
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                <ActivityRing active={!backendFailed} />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-soft">
                    Analysing your document
                  </p>
                  <h1
                    className="mt-2 max-w-xl text-[28px] font-semibold leading-[1.16] tracking-[-0.03em] text-ink sm:text-[34px]"
                    aria-live="polite"
                  >
                    {copy.title}
                  </h1>
                  <p className="mt-3 max-w-xl text-[14px] leading-6 text-ink-soft">{copy.body}</p>

                  {!backendFailed && !isLoading ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span
                        className="inline-flex min-h-8 items-center gap-2 rounded-full bg-white px-3 text-[12px] font-medium text-ink-soft"
                        role="status"
                        aria-live="polite"
                      >
                        <span className="relative flex h-2 w-2" aria-hidden>
                          <span
                            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 motion-reduce:animate-none"
                            style={{ backgroundColor: accent }}
                          />
                          <span
                            className="relative inline-flex h-2 w-2 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                        </span>
                        {formatElapsedTime(elapsedSeconds)}
                      </span>

                      {detectedDocumentType ? (
                        <span className="text-[12px] text-ink-soft">
                          {toTitleCase(detectedDocumentType)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-8 border-y border-line bg-white px-4 py-2 sm:px-5">
              {steps.map((step) => {
                const indices = step.statuses.map((item) => order.indexOf(item));
                const stepIndex = Math.max(...indices);
                const stepMinIndex = Math.min(...indices);
                const done = currentIndex > stepIndex && currentIndex >= 0;
                const active =
                  !done &&
                  currentIndex >= stepMinIndex &&
                  currentIndex <= stepIndex &&
                  currentIndex >= 0;

                return (
                  <StepRow
                    key={step.label}
                    label={step.label}
                    done={done}
                    active={active}
                    accent={accent}
                  />
                );
              })}
            </div>

            {!backendFailed && !isLoading ? (
              <p className="mt-5 text-[12.5px] leading-5 text-ink-soft">
                Your result will open automatically when it is ready.
                {elapsedSeconds >= 45 ? " Detailed documents can take a little longer." : ""}
              </p>
            ) : null}

            {showProcessingError ? (
              <div className="mt-6 border-l-2 border-stamp-red bg-red-50/70 px-4 py-3" role="alert">
                <p className="text-[13px] font-semibold text-ink">We could not finish this step</p>
                <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                  {backendFailed
                    ? copy.body
                    : (queryError ?? "We could not check this document. Please try again.")}
                </p>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

function NeedsReviewNav({ solutionSlug }: { solutionSlug?: string }) {
  return (
    <div className="mt-8 flex w-full max-w-[360px] flex-col gap-3 sm:flex-row">
      <Link
        to="/home"
        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-teal px-4 text-[14px] font-semibold text-white"
      >
        Back to Home
      </Link>
      <Link
        to="/upload"
        search={solutionSlug ? { solution: solutionSlug } : {}}
        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-line bg-white px-4 text-[14px] font-semibold text-ink"
      >
        Upload another
      </Link>
    </div>
  );
}

function NeedsReviewState({
  failureCode,
  detectedDocumentType,
  failureMessage,
  solutionSlug,
}: {
  failureCode: DocumentFailureCode | null;
  detectedDocumentType: string | null;
  failureMessage: string | null;
  solutionSlug?: string;
}) {
  const readableDocumentType = detectedDocumentType ? toTitleCase(detectedDocumentType) : null;
  const state = reviewState(failureCode, readableDocumentType);

  return (
    <div className="max-w-2xl">
      <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-stamp-amber/15 text-stamp-amber">
        {state.icon}
      </div>
      <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.06em] text-stamp-amber">
        Needs a closer look
      </p>
      <h1 className="mt-2 text-[28px] font-semibold leading-[1.18] tracking-[-0.03em] text-ink">
        {state.title}
      </h1>
      <p className="mt-3 max-w-xl text-[14px] leading-6 text-ink-soft">{state.body}</p>

      {readableDocumentType ? (
        <div className="mt-5 border-l-2 border-line pl-4">
          <p className="text-[12px] font-semibold text-ink-soft">Document identified as</p>
          <p className="mt-1 text-[14px] font-semibold text-ink">{readableDocumentType}</p>
        </div>
      ) : null}

      {failureMessage ? (
        <p className="mt-5 max-w-xl text-[12.5px] leading-5 text-ink-soft" role="status">
          {failureMessage}
        </p>
      ) : null}

      <NeedsReviewNav solutionSlug={solutionSlug} />
    </div>
  );
}

function reviewState(
  failureCode: DocumentFailureCode | null,
  readableDocumentType: string | null,
): { title: string; body: string; icon: ReactNode } {
  switch (failureCode) {
    case "DOCUMENT_NOT_SUPPORTED":
      return {
        title: "This document is not supported yet",
        body: readableDocumentType
          ? "Untangle could identify the document, but this document type is not currently supported for analysis."
          : "Untangle could not route this document to a supported specialist analysis.",
        icon: <FileText size={25} strokeWidth={1.8} aria-hidden />,
      };
    case "MODULE_NOT_ACTIVE":
      return {
        title: "We recognised the document, but this specialist tool is not active",
        body: "The document belongs to an Untangle product that is not currently available for customer analysis.",
        icon: <Search size={25} strokeWidth={1.8} aria-hidden />,
      };
    case "JURISDICTION_NOT_SUPPORTED":
      return {
        title: "This document is outside the current South African scope",
        body: "Untangle South Africa currently supports the document and legal/tax contexts defined for its South African specialist products.",
        icon: <Globe size={25} strokeWidth={1.8} aria-hidden />,
      };
    case "MODULE_DETECTION_LOW_CONFIDENCE":
      return {
        title: "We could not identify this document confidently",
        body: "Please check that the document is clear and complete, then try uploading it again.",
        icon: <FileQuestion size={25} strokeWidth={1.8} aria-hidden />,
      };
    default:
      return {
        title: "This document needs a closer look",
        body: "Some important details could not be confirmed automatically, so Untangle has stopped rather than guessing.",
        icon: <FileQuestion size={25} strokeWidth={1.8} aria-hidden />,
      };
  }
}

function formatElapsedTime(seconds: number) {
  if (seconds < 60) return `${seconds}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${minutes} min ${secs} s elapsed`;
}

function ActivityRing({ active }: { active: boolean }) {
  return (
    <div className="relative grid h-[104px] w-[104px] shrink-0 place-items-center sm:h-[116px] sm:w-[116px]">
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

function StepRow({
  label,
  done,
  active,
  accent,
}: {
  label: string;
  done: boolean;
  active?: boolean;
  accent: string;
}) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 border-t border-line/70 first:border-t-0">
      <div
        className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border-2"
        style={{
          borderColor: done || active ? accent : "var(--line)",
          backgroundColor: done ? accent : active ? "color-mix(in srgb, " + accent + " 10%, white)" : "white",
        }}
      >
        {done ? <span className="text-[12px] font-bold text-white">✓</span> : null}
        {!done && active ? (
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        ) : null}
      </div>
      <span className={done || active ? "text-[13.5px] font-medium text-ink" : "text-[13.5px] text-ink-soft"}>
        {label}
      </span>
    </div>
  );
}
