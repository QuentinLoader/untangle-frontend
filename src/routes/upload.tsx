import { useRef, useState } from "react";
import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import { usageLine } from "@/lib/entitlements";
import { ApiError } from "@/lib/api-client";
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

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "New document — Untangle" },
      {
        name: "description",
        content: "Snap or upload a SARS letter, lease, agreement or job offer to have it explained.",
      },
      { property: "og:title", content: "New document — Untangle" },
      {
        property: "og:description",
        content: "Snap or upload your document and get it in plain English.",
      },
    ],
  }),
  component: withAuth(Upload),
});

const ACCEPT = [...SUPPORTED_MIME_TYPES, ".heic", ".heif", ".tif", ".tiff"].join(",");

function Upload() {
  const navigate = useNavigate();
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
    if (uploadStatus === "requesting-url" || uploadStatus === "uploading" || uploadStatus === "verifying")
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
              : "Continue upload";


  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        <header className="flex items-center gap-3 pt-7">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label="Go back"
          >
            <span className="text-[19px]">←</span>
          </Link>
          <h1 className="font-display text-[17px] font-semibold text-ink">New document</h1>
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

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="grid h-[210px] w-[210px] place-items-center rounded-[24px] border-[3px] border-dashed border-teal bg-teal-dim text-5xl transition-transform active:scale-[0.98] disabled:opacity-60"
            aria-label="Snap or upload your document"
          >
            {pending ? "✅" : "📷"}
          </button>

          <h2 className="mt-8 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            {uploadStatus === "queued"
              ? "Upload verified"
              : pending
                ? "Document prepared securely"
                : "Snap or upload your document"}
          </h2>

          {pending ? (
            <div className="mt-4 w-full max-w-[280px] rounded-[14px] border border-line bg-card p-[14px]">
              <p className="truncate text-[14px] font-semibold text-ink">
                {pending.originalFilename}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                {formatFileSize(pending.sizeBytes)}
              </p>
              <p className="mt-3 font-mono text-[10.5px] font-bold uppercase tracking-wide text-teal">
                {uploadStatus === "queued" ? "🔒 Upload verified" : "Ready to upload"}
              </p>
              {uploadStatus === "queued" && (
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                  Your document is queued for processing.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
              Works for SARS letters, leases, purchase agreements or job offers — you don't need to
              tell us which.
            </p>
          )}

          {(busy || uploadProgressMessage) && (
            <p
              className="mt-4 font-mono text-[11px] uppercase tracking-wide text-ink-soft"
              role="status"
            >
              {busy ? "Preparing document…" : uploadProgressMessage}
            </p>
          )}

          {error && (
            <p className="mt-4 max-w-[280px] text-center text-[13px] text-stamp-red" role="alert">
              {error}
            </p>
          )}

          {planUsageLine ? (
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              {planUsageLine}
            </p>
          ) : null}

          <div className="mt-8 w-full max-w-[280px] space-y-3">
            {analysesUsedUp && !pending ? (
              <UpgradePrompt
                title="Free analyses used"
                message="You've used your free analyses for this month. Untangle Plus gives you more."
              />
            ) : pending ? (
              <>
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
              </>
            ) : (
              <>
                <PrimaryButton onClick={() => cameraInputRef.current?.click()} disabled={busy}>
                  {busy ? "Preparing…" : "Take a photo"}
                </PrimaryButton>
                <SecondaryButton onClick={() => fileInputRef.current?.click()} disabled={busy}>
                  Choose from files
                </SecondaryButton>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
