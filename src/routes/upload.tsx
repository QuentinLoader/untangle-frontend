import { useRef, useState } from "react";
import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  FileText,
  Lock,
  ShieldCheck,
  Timer,
  Upload as UploadIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import { usageLine } from "@/lib/entitlements";
import { ApiError } from "@/lib/api-client";
import { findSolution } from "@/lib/solutions";
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
      { title: "Upload a document — Untangle" },
      {
        name: "description",
        content:
          "Upload a South African tax letter, residential lease, insurance policy or employment document to have it explained.",
      },
      { property: "og:title", content: "Upload a document — Untangle" },
      {
        property: "og:description",
        content: "Upload your document and get it explained in plain English.",
      },
    ],
  }),
  component: withAuth(Upload),
});

const ACCEPT = [...SUPPORTED_MIME_TYPES, ".heic", ".heif", ".tif", ".tiff"].join(",");

const TRUST = [
  { icon: Lock, text: "Secure processing" },
  { icon: ShieldCheck, text: "Your document is private" },
  { icon: Timer, text: "Files are handled according to Untangle's retention rules" },
];

function Upload() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { solution: solutionSlug } = Route.useSearch();
  const solution = solutionSlug ? findSolution(solutionSlug) : undefined;
  const operationalSolution = solution?.operational ? solution : undefined;
  const { entitlements } = useEntitlements();
  const analysesUsedUp =
    entitlements !== null &&
    !entitlements.unlimitedAnalyses &&
    entitlements.remainingAnalyses !== null &&
    entitlements.remainingAnalyses <= 0;
  const planUsageLine = entitlements ? usageLine(entitlements) : null;
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File object + clientRequestId live in memory only.
  const selectedFileRef = useRef<File | null>(null);
  const clientRequestIdRef = useRef<string | null>(null);

  const [pending, setPending] = useState<PendingDocumentUpload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<DirectUploadStatus>("idle");
  const [uploadProgressMessage, setUploadProgressMessage] = useState<string | null>(null);
  // True once the file bytes are in storage; lets a retry skip straight to verification.
  const s3UploadedRef = useRef(false);

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

    // Reuse the id when retrying the same file; new file gets a new id.
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
    )
      return;

    setError(null);

    try {
      if (!s3UploadedRef.current) {
        // Always request a fresh signed URL; it is used immediately and never stored.
        setUploadStatus("requesting-url");
        setUploadProgressMessage("Preparing a secure upload…");
        const signed = await requestUploadUrl(pending.documentId);
        setUploadStatus("uploading");
        setUploadProgressMessage("Sending your document securely…");
        await uploadFileToSignedUrl(signed.data.upload, pending.file);
        s3UploadedRef.current = true;
      }

      setUploadStatus("verifying");
      setUploadProgressMessage("Verifying upload…");
      // No body: the backend verifies the stored object itself.
      const completed = await completeUpload(pending.documentId);
      const doc = completed.data.document;
      setUploadStatus("queued");
      // A new document exists on the backend: refresh Home and Documents listings.
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      setUploadProgressMessage(null);
      navigate({ to: "/processing/$documentId", params: { documentId: doc.id } });
    } catch (err) {
      // Object missing in storage means the bytes must be sent again.
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
          ? "Verifying upload…"
          : uploadStatus === "queued"
            ? "Queued for processing"
            : uploadStatus === "failed"
              ? "Try upload again"
              : "Continue";

  const title = operationalSolution ? operationalSolution.uploadTitle : "Upload a document";
  const hint = operationalSolution
    ? operationalSolution.uploadHint
    : "Untangle will work out which supported product the document belongs to.";

  return (
    <div className="flex min-h-screen flex-col bg-paper pb-[104px]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6">
        <Link
          to="/"
          aria-label="Go back"
          className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors active:bg-paper-2"
        >
          <ArrowLeft size={20} aria-hidden />
        </Link>

        <header className="mt-3">
          {operationalSolution ? (
            <p className="text-[13px] font-semibold text-teal">{operationalSolution.name}</p>
          ) : null}
          <h1 className="mt-1 font-display text-[24px] font-semibold leading-tight text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{hint}</p>
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
          <div className="mt-6">
            <UpgradePrompt
              title="Free analyses used"
              message="You've used your free analyses for this month. Untangle Plus gives you more."
            />
          </div>
        ) : pending ? (
          <div className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-line/70 bg-white px-4 py-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-dim text-teal">
                <FileText size={20} strokeWidth={1.9} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink">
                  {pending.originalFilename}
                </span>
                <span className="mt-0.5 block text-[12.5px] text-ink-soft">
                  {formatFileSize(pending.sizeBytes)} ·{" "}
                  {uploadStatus === "queued" ? "Upload verified" : "Ready to upload"}
                </span>
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <PrimaryButton
                onClick={() => void startUpload()}
                disabled={uploadInFlight}
                className={uploadInFlight ? "opacity-60" : ""}
              >
                {uploadLabel}
              </PrimaryButton>
              <SecondaryButton
                onClick={() => fileInputRef.current?.click()}
                disabled={busy || uploadInFlight}
              >
                Choose a different file
              </SecondaryButton>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="rounded-3xl border-2 border-dashed border-teal/35 bg-white px-5 py-7">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="flex w-full flex-col items-center rounded-2xl px-2 py-2 text-center transition-colors active:bg-teal-dim/40 disabled:opacity-60"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-teal-dim text-teal">
                  <UploadIcon size={24} strokeWidth={1.9} aria-hidden />
                </span>
                <span className="mt-4 text-[16px] font-semibold text-ink">
                  Tap to upload your document
                </span>
                <span className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                  PDF, JPG, PNG, HEIC or TIFF · up to 25 MB
                </span>
              </button>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" aria-hidden />
                <span className="text-[12.5px] text-ink-soft">or</span>
                <span className="h-px flex-1 bg-line" aria-hidden />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white text-[15px] font-semibold text-ink transition-colors active:bg-paper-2 disabled:opacity-60"
              >
                <FolderOpen size={18} aria-hidden />
                Choose a file
              </button>
            </div>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={busy}
              className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white text-[15px] font-semibold text-ink transition-colors active:bg-paper-2 disabled:opacity-60"
            >
              <Camera size={18} aria-hidden />
              {busy ? "Preparing…" : "Take a photo instead"}
            </button>
          </div>
        )}

        {(busy || uploadProgressMessage) && (
          <p className="mt-4 text-center text-[13px] text-ink-soft" role="status">
            {busy ? "Preparing document…" : uploadProgressMessage}
          </p>
        )}

        {error && (
          <p className="mt-4 text-center text-[13px] text-stamp-red" role="alert">
            {error}
          </p>
        )}

        <ul className="mt-8 space-y-2.5">
          {TRUST.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.text} className="flex items-start gap-2.5 text-[12.5px] text-ink-soft">
                <Icon size={15} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <span>{item.text}</span>
              </li>
            );
          })}
        </ul>

        {planUsageLine && !entitlements?.isPlus ? (
          <p className="mt-5 text-[12.5px] text-ink-soft">{planUsageLine}</p>
        ) : null}
      </div>
      <BottomTabBar active="Home" />
    </div>
  );
}
