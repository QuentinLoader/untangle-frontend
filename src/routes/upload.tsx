import { useRef, useState } from "react";
import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  FileText,
  FolderOpen,
  LockKeyhole,
  ShieldCheck,
  Upload as UploadIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/untangle/v2/AppShell";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import { usageLine } from "@/lib/entitlements";
import { ApiError } from "@/lib/api-client";
import { findSolution, SOLUTION_LIST } from "@/lib/solutions";
import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_MIME_TYPES,
  createDocumentRecord,
  formatFileSize,
  friendlyDocumentError,
  isSupportedMimeType,
  requestUploadUrl,
  resolveMimeType,
  completeUpload,
  uploadFileToSignedUrl,
  type DirectUploadStatus,
  type PendingDocumentUpload,
} from "@/lib/documents";

type UploadSearch = { solution?: string };

export const Route = createFileRoute("/upload")({
  validateSearch: (search: Record<string, unknown>): UploadSearch => {
    const solution = typeof search["solution"] === "string" ? search["solution"] : undefined;
    return solution ? { solution } : {};
  },
  head: () => ({
    meta: [
      { title: "Upload a document — Untangle South Africa" },
      {
        name: "description",
        content: "Upload an important South African document securely and get a clear specialist explanation.",
      },
    ],
  }),
  component: withAuth(Upload),
});

const ACCEPT = [...SUPPORTED_MIME_TYPES, ".heic", ".heif", ".tif", ".tiff"].join(",");

function Upload() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { solution: solutionSlug } = Route.useSearch();
  const selectedSolution = solutionSlug ? findSolution(solutionSlug) : undefined;
  const operationalSolution = selectedSolution?.operational ? selectedSolution : undefined;
  const { entitlements } = useEntitlements();

  const analysesUsedUp =
    entitlements !== null &&
    !entitlements.unlimitedAnalyses &&
    entitlements.remainingAnalyses !== null &&
    entitlements.remainingAnalyses <= 0;
  const planUsageLine = entitlements ? usageLine(entitlements) : null;

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);
  const clientRequestIdRef = useRef<string | null>(null);
  const s3UploadedRef = useRef(false);

  const [pending, setPending] = useState<PendingDocumentUpload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<DirectUploadStatus>("idle");
  const [uploadProgressMessage, setUploadProgressMessage] = useState<string | null>(null);

  const prepare = async (file: File) => {
    if (busy || analysesUsedUp) return;
    setError(null);
    setPending(null);
    setUploadStatus("idle");
    setUploadProgressMessage(null);
    s3UploadedRef.current = false;

    const mimeType = resolveMimeType(file);
    if (!isSupportedMimeType(mimeType)) {
      setError("This file type is not supported.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("This document is larger than the 25 MB upload limit.");
      return;
    }

    const sameFile =
      selectedFileRef.current &&
      selectedFileRef.current.name === file.name &&
      selectedFileRef.current.size === file.size &&
      selectedFileRef.current.lastModified === file.lastModified;

    if (!sameFile || !clientRequestIdRef.current) {
      clientRequestIdRef.current = crypto.randomUUID();
    }

    selectedFileRef.current = file;
    const clientRequestId = clientRequestIdRef.current;

    setBusy(true);
    try {
      const response = await createDocumentRecord({
        clientRequestId,
        originalFilename: file.name,
        mimeType,
        sizeBytes: file.size,
      });
      const doc = response.data.document;
      setPending({
        file,
        clientRequestId,
        documentId: doc.id,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
      });
    } catch (err) {
      setError(friendlyDocumentError(err));
    } finally {
      setBusy(false);
    }
  };

  const startUpload = async () => {
    if (!pending) return;
    if (
      uploadStatus === "requesting-url" ||
      uploadStatus === "uploading" ||
      uploadStatus === "verifying"
    ) {
      return;
    }

    setError(null);

    try {
      if (!s3UploadedRef.current) {
        setUploadStatus("requesting-url");
        setUploadProgressMessage("Preparing a secure upload…");
        const signed = await requestUploadUrl(pending.documentId);

        setUploadStatus("uploading");
        setUploadProgressMessage("Sending your document securely…");
        await uploadFileToSignedUrl(signed.data.upload, pending.file);
        s3UploadedRef.current = true;
      }

      setUploadStatus("verifying");
      setUploadProgressMessage("Checking the uploaded file…");
      const completed = await completeUpload(pending.documentId);
      const doc = completed.data.document;

      setUploadStatus("queued");
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      setUploadProgressMessage(null);

      navigate({
        to: "/processing/$documentId",
        params: { documentId: doc.id },
        search: operationalSolution ? { solution: operationalSolution.slug } : {},
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === "UPLOADED_OBJECT_NOT_FOUND") {
        s3UploadedRef.current = false;
      }
      setUploadStatus("failed");
      setUploadProgressMessage(null);
      setError(friendlyDocumentError(err));
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void prepare(file);
  };

  const uploadInFlight =
    uploadStatus === "requesting-url" ||
    uploadStatus === "uploading" ||
    uploadStatus === "verifying";

  const uploadLabel =
    uploadStatus === "requesting-url"
      ? "Preparing secure upload…"
      : uploadStatus === "uploading"
        ? "Uploading securely…"
        : uploadStatus === "verifying"
          ? "Checking upload…"
          : uploadStatus === "queued"
            ? "Ready for analysis"
            : uploadStatus === "failed"
              ? "Try upload again"
              : "Continue to analysis";

  const title = operationalSolution
    ? operationalSolution.slug === "taxsnap"
      ? "Upload your SARS document"
      : operationalSolution.slug === "leasecheck"
        ? "Upload your agreement"
        : operationalSolution.uploadTitle
    : "Upload an important document";

  const intro = operationalSolution
    ? operationalSolution.slug === "taxsnap"
      ? "Use the original SARS letter, notice or assessment. TaxSnap will identify the supported document type and then explain what matters."
      : operationalSolution.slug === "leasecheck"
        ? "Use the agreement or lease-related notice you want to understand. LeaseCheck will identify its role before explaining the important terms and consequences."
        : operationalSolution.uploadHint
    : "You do not need to classify it first. Untangle will identify the supported specialist experience from the document.";

  const SpecialistIcon = operationalSolution?.icon ?? FileText;

  return (
    <AppShell active="Home" planLabel={entitlements?.isPlus ? "Plus" : "Free"}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,760px)_320px] lg:gap-14">
        <div className="min-w-0">
          {operationalSolution ? (
            <Link
              to="/solutions/$slug"
              params={{ slug: operationalSolution.slug }}
              className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
            >
              <ArrowLeft size={18} aria-hidden />
              Back to {operationalSolution.name}
            </Link>
          ) : (
            <Link
              to="/home"
              className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
            >
              <ArrowLeft size={18} aria-hidden />
              Back to Home
            </Link>
          )}

          <header className="mt-5">
            <div className="flex items-start gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-teal"
                style={{ backgroundColor: operationalSolution?.tint ?? "var(--paper-2)" }}
                aria-hidden
              >
                <SpecialistIcon size={20} strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-teal">
                  {operationalSolution ? operationalSolution.name : "Untangle South Africa"}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                  {operationalSolution ? "Part of Untangle South Africa" : "We’ll identify the right specialist tool"}
                </p>
              </div>
            </div>

            <h1 className="mt-5 max-w-2xl text-[29px] font-semibold leading-[1.16] tracking-[-0.035em] text-ink sm:text-[36px]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-soft">{intro}</p>
          </header>

          <input
            ref={cameraInputRef}
            type="file"
            accept={ACCEPT}
            capture="environment"
            onChange={onInputChange}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={onInputChange}
            className="hidden"
          />

          {analysesUsedUp && !pending ? (
            <div className="mt-7 max-w-2xl">
              <UpgradePrompt
                title="Free analyses used"
                message="You've used your free analyses for this month. Untangle Plus gives you more."
              />
            </div>
          ) : pending ? (
            <section className="mt-7 max-w-2xl">
              <div className="border-y border-line bg-white px-4 py-5 sm:px-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-dim text-teal">
                    <FileText size={20} strokeWidth={1.9} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-[15px] font-semibold text-ink">
                      {pending.originalFilename}
                    </span>
                    <span className="mt-1 block text-[12.5px] text-ink-soft">
                      {formatFileSize(pending.sizeBytes)} ·{" "}
                      {uploadStatus === "queued" ? "Upload verified" : "Ready for secure upload"}
                    </span>
                  </span>
                  <CheckCircle2 size={19} className="mt-1 shrink-0 text-teal" aria-hidden />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton
                  onClick={() => void startUpload()}
                  disabled={uploadInFlight}
                  className="sm:max-w-[280px]"
                >
                  {uploadLabel}
                </PrimaryButton>
                <SecondaryButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy || uploadInFlight}
                  className="sm:max-w-[230px]"
                >
                  Choose another file
                </SecondaryButton>
              </div>
            </section>
          ) : (
            <section className="mt-7 max-w-2xl">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="group flex min-h-[230px] w-full flex-col items-center justify-center border-2 border-dashed border-teal/30 bg-white px-6 py-8 text-center transition-colors hover:border-teal/55 hover:bg-[#fbfdfb] disabled:opacity-60"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-teal-dim text-teal transition-transform group-hover:scale-[1.03]">
                  <UploadIcon size={24} strokeWidth={1.9} aria-hidden />
                </span>
                <span className="mt-4 text-[17px] font-semibold text-ink">Choose your document</span>
                <span className="mt-2 max-w-md text-[13px] leading-6 text-ink-soft">
                  PDF, JPG, PNG, HEIC or TIFF · up to 25 MB
                </span>
                <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-4 text-[14px] font-semibold text-white">
                  Browse files
                  <FolderOpen size={17} aria-hidden />
                </span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={busy}
                className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-paper-2 disabled:opacity-60 sm:w-auto"
              >
                <Camera size={18} aria-hidden />
                {busy ? "Preparing…" : "Take a photo instead"}
              </button>
            </section>
          )}

          {(busy || uploadProgressMessage) && (
            <p className="mt-4 max-w-2xl text-[13px] text-ink-soft" role="status">
              {busy ? "Preparing your document…" : uploadProgressMessage}
            </p>
          )}

          {error && (
            <div className="mt-5 max-w-2xl border-l-4 border-stamp-red bg-red-50 px-4 py-3" role="alert">
              <p className="text-[13.5px] font-semibold text-ink">We could not continue</p>
              <p className="mt-1 text-[13px] leading-5 text-ink-soft">{error}</p>
            </div>
          )}

          {planUsageLine && !entitlements?.isPlus ? (
            <p className="mt-5 text-[12.5px] text-ink-soft">{planUsageLine}</p>
          ) : null}

          {!operationalSolution && !pending ? (
            <section className="mt-10 max-w-2xl border-t border-line pt-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                Prefer to start with a specialist tool?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOLUTION_LIST.filter((item) => item.operational).map((item) => (
                  <Link
                    key={item.slug}
                    to="/solutions/$slug"
                    params={{ slug: item.slug }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-2"
                  >
                    {item.name}
                    <ArrowRight size={15} aria-hidden />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0">
          <div className="space-y-4 lg:sticky lg:top-[104px]">
            <section className="rounded-[16px] border border-line bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                What happens next
              </p>
              <ol className="mt-4 space-y-4">
                {[
                  ["1", "Secure upload", "Your file is sent directly to protected document storage."],
                  ["2", "Identify and read", "Untangle identifies the supported document and extracts the details that matter."],
                  ["3", "Check before explaining", "The result is validated before the specialist explanation is shown."],
                ].map(([step, stepTitle, detail]) => (
                  <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-dim text-[12px] font-semibold text-teal">
                      {step}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-semibold text-ink">{stepTitle}</p>
                      <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-[16px] border border-line bg-white p-5">
              <div className="flex gap-3">
                <LockKeyhole size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">Your document stays private</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                    Only your authenticated Untangle account can access your document and result.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-3 border-t border-line pt-4">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">We do not need you to classify it</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                    The system checks the document type before using a specialist result experience.
                  </p>
                </div>
              </div>
            </section>

            <p className="px-1 text-[11.5px] leading-5 text-ink-soft">
              Untangle South Africa is an AddVision product.{" "}
              <Link to="/terms" className="font-medium text-teal underline underline-offset-2">
                Terms &amp; privacy
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
