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
        content: "Upload an important South African document securely for specialist analysis.",
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
        setUploadProgressMessage("Preparing secure upload…");
        const signed = await requestUploadUrl(pending.documentId);

        setUploadStatus("uploading");
        setUploadProgressMessage("Uploading your document securely…");
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
      ? "Preparing…"
      : uploadStatus === "uploading"
        ? "Uploading…"
        : uploadStatus === "verifying"
          ? "Checking upload…"
          : uploadStatus === "queued"
            ? "Ready"
            : uploadStatus === "failed"
              ? "Try again"
              : "Continue";

  const isTax = operationalSolution?.slug === "taxsnap";
  const isLease = operationalSolution?.slug === "leasecheck";
  const accent = isTax ? "var(--stamp-red)" : isLease ? "var(--teal)" : "var(--teal)";
  const title = isTax
    ? "Upload your SARS document"
    : isLease
      ? "Upload your agreement"
      : "Upload a document";
  const intro = isTax
    ? "Use the original letter, notice or assessment."
    : isLease
      ? "Use the agreement or lease-related notice you want to understand."
      : "You don’t need to know which specialist tool it belongs to.";

  const SpecialistIcon = operationalSolution?.icon ?? FileText;

  return (
    <AppShell active="Home" planLabel={entitlements?.isPlus ? "Plus" : "Free"}>
      <div className="mx-auto w-full max-w-[760px]">
        {operationalSolution ? (
          <Link
            to="/solutions/$slug"
            params={{ slug: operationalSolution.slug }}
            className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
          >
            <ArrowLeft size={18} aria-hidden />
            {operationalSolution.name}
          </Link>
        ) : (
          <Link
            to="/home"
            className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
          >
            <ArrowLeft size={18} aria-hidden />
            Home
          </Link>
        )}

        <header className="mt-5 border-l-[3px] pl-4" style={{ borderLeftColor: accent }}>
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{
                backgroundColor: operationalSolution?.tint ?? "var(--paper-2)",
                color: accent,
              }}
              aria-hidden
            >
              <SpecialistIcon size={18} strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink">
                {operationalSolution?.name ?? "Untangle South Africa"}
              </p>
              {operationalSolution ? (
                <p className="mt-0.5 text-[11.5px] text-ink-soft">Part of Untangle South Africa</p>
              ) : null}
            </div>
          </div>

          <h1 className="mt-5 text-[29px] font-semibold leading-[1.16] tracking-[-0.035em] text-ink sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-ink-soft">{intro}</p>
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
          <div className="mt-7">
            <UpgradePrompt
              title="Free analyses used"
              message="You've used your free analyses for this month. Untangle Plus gives you more."
            />
          </div>
        ) : pending ? (
          <section className="mt-7">
            <div className="border-y border-line bg-white px-4 py-4 sm:px-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper-2 text-teal">
                  <FileText size={18} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-[14.5px] font-semibold text-ink">
                    {pending.originalFilename}
                  </span>
                  <span className="mt-1 block text-[12px] text-ink-soft">
                    {formatFileSize(pending.sizeBytes)}
                  </span>
                </span>
                <CheckCircle2 size={18} className="mt-1 shrink-0 text-teal" aria-hidden />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton
                onClick={() => void startUpload()}
                disabled={uploadInFlight}
                className="sm:max-w-[220px]"
              >
                {uploadLabel}
              </PrimaryButton>
              <SecondaryButton
                onClick={() => fileInputRef.current?.click()}
                disabled={busy || uploadInFlight}
                className="sm:max-w-[220px]"
              >
                Choose another file
              </SecondaryButton>
            </div>
          </section>
        ) : (
          <section className="mt-7">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="group flex min-h-[220px] w-full flex-col items-center justify-center border-2 border-dashed border-line bg-white px-6 py-8 text-center transition-colors hover:border-teal/45 hover:bg-[#fbfdfb] disabled:opacity-60"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-teal-dim text-teal">
                <UploadIcon size={24} strokeWidth={1.9} aria-hidden />
              </span>
              <span className="mt-4 text-[17px] font-semibold text-ink">Choose your document</span>
              <span className="mt-1.5 text-[12.5px] text-ink-soft">
                PDF, JPG, PNG, HEIC or TIFF · up to 25 MB
              </span>
              <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-4 text-[14px] font-semibold text-white">
                Browse files
                <FolderOpen size={16} aria-hidden />
              </span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={busy}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-paper-2 disabled:opacity-60 sm:w-auto"
            >
              <Camera size={17} aria-hidden />
              {busy ? "Preparing…" : "Take a photo instead"}
            </button>
          </section>
        )}

        {(busy || uploadProgressMessage) ? (
          <p className="mt-4 text-[13px] text-ink-soft" role="status">
            {busy ? "Preparing your document…" : uploadProgressMessage}
          </p>
        ) : null}

        {error ? (
          <div className="mt-5 border-l-2 border-stamp-red bg-red-50/70 px-4 py-3" role="alert">
            <p className="text-[13px] font-semibold text-ink">We could not continue</p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{error}</p>
          </div>
        ) : null}

        <div className="mt-5 flex items-start gap-2 text-[12px] leading-5 text-ink-soft">
          <LockKeyhole size={15} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <p>Your document is private to your authenticated Untangle account.</p>
        </div>

        {planUsageLine && !entitlements?.isPlus ? (
          <p className="mt-3 text-[12px] text-ink-soft">{planUsageLine}</p>
        ) : null}

        {!operationalSolution && !pending ? (
          <div className="mt-8 border-t border-line pt-5">
            <p className="text-[12px] text-ink-soft">Or start with a specialist tool</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SOLUTION_LIST.filter((item) => item.operational).map((item) => (
                <Link
                  key={item.slug}
                  to="/solutions/$slug"
                  params={{ slug: item.slug }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-2"
                >
                  {item.name}
                  <ArrowRight size={14} aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
