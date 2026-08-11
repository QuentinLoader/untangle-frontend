import { apiRequest, ApiError } from "./api-client";

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "image/tiff",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const EXTENSION_MIME: Record<string, string> = {
  heic: "image/heic",
  heif: "image/heif",
  tif: "image/tiff",
  tiff: "image/tiff",
};

/** Uses the browser MIME type, falling back to a known extension for HEIC/HEIF/TIFF. */
export function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[ext] ?? "";
}

export function isSupportedMimeType(mimeType: string): boolean {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type CreateDocumentRequest = {
  clientRequestId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
};

export type CreateDocumentResponse = {
  success: true;
  data: {
    created: boolean;
    document: {
      id: string;
      clientRequestId: string;
      originalFilename: string;
      mimeType: string;
      sizeBytes: number;
      pageCount: number | null;
      uploadStatus: "AWAITING_UPLOAD";
      processingStatus: "NOT_STARTED";
      detectedModule: null;
      detectedDocumentType: null;
      uploadedAt: null;
      retentionExpiresAt: string;
      createdAt: string;
      updatedAt: string;
    };
    usage: {
      plan: "FREE" | "PLUS_MONTHLY" | "PLUS_ANNUAL";
      successfulAnalyses: number;
      limit: number | null;
      remaining: number | null;
    };
  };
};

/** In-memory only — never persisted (the File object is needed for the next upload step). */
export type PendingDocumentUpload = {
  file: File;
  clientRequestId: string;
  documentId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
};

export async function createDocumentRecord(
  body: CreateDocumentRequest,
): Promise<CreateDocumentResponse> {
  return apiRequest<CreateDocumentResponse>("/api/v1/documents", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type DirectUploadStatus =
  | "idle"
  | "requesting-url"
  | "uploading"
  | "verifying"
  | "queued"
  | "failed";

export type CreateUploadUrlResponse = {
  success: true;
  data: {
    document: {
      id: string;
      originalFilename: string;
      mimeType: string;
      sizeBytes: number;
      uploadStatus: "UPLOADING";
    };
    upload: {
      method: "PUT";
      url: string;
      headers: { "Content-Type": string };
      expiresAt: string;
      expiresInSeconds: number;
    };
  };
};

/** Thrown for direct-to-storage failures; never carries the signed URL. */
export class DirectUploadError extends Error {
  kind: "forbidden" | "network" | "status";
  status: number | undefined;
  constructor(kind: "forbidden" | "network" | "status", status?: number) {
    super(`S3 upload failed with status ${status ?? 0}`);
    this.name = "DirectUploadError";
    this.kind = kind;
    this.status = status;
  }
}

/** Requests a fresh signed upload URL (no body). */
export async function requestUploadUrl(documentId: string): Promise<CreateUploadUrlResponse> {
  return apiRequest<CreateUploadUrlResponse>(`/api/v1/documents/${documentId}/upload-url`, {
    method: "POST",
  });
}

/**
 * Uploads raw file bytes straight to storage with the signed URL.
 * No auth header, no FormData, no base64; the URL is never stored or logged.
 */
export async function uploadFileToSignedUrl(
  upload: CreateUploadUrlResponse["data"]["upload"],
  file: File,
): Promise<{ etagPresent: boolean; status: number }> {
  let response: Response;
  try {
    response = await fetch(upload.url, {
      method: upload.method,
      headers: upload.headers,
      body: file,
    });
  } catch {
    throw new DirectUploadError("network");
  }
  if (!response.ok) {
    throw new DirectUploadError(response.status === 403 ? "forbidden" : "status", response.status);
  }
  return { etagPresent: response.headers.get("ETag") !== null, status: response.status };
}

const CODE_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "Please sign in again to continue.",
  DOCUMENT_TOO_LARGE: "This document is larger than the 25 MB upload limit.",
  UNSUPPORTED_DOCUMENT_TYPE: "This file type is not supported.",
  FREE_ALLOWANCE_EXHAUSTED: "You have used your free document analyses for this month.",
  IDEMPOTENCY_CONFLICT: "This upload could not be resumed. Please select the document again.",
  DATABASE_UNAVAILABLE: "Untangle is temporarily unavailable. Please try again.",
  DOCUMENT_NOT_FOUND: "This document could not be found. Please select it again.",
  DOCUMENT_ALREADY_UPLOADED: "This document has already been uploaded.",
  DOCUMENT_UPLOAD_STATE_INVALID: "This document cannot be uploaded in its current state.",
  STORAGE_NOT_CONFIGURED: "Secure document storage is temporarily unavailable.",
  STORAGE_UNAVAILABLE: "Untangle could not verify the file. Please try again.",
  UPLOADED_OBJECT_NOT_FOUND: "We could not find the uploaded file. Please upload it again.",
  UPLOAD_SIZE_MISMATCH: "The uploaded file did not match the selected document.",
  UPLOAD_CONTENT_TYPE_MISSING: "The uploaded file type could not be verified.",
  UPLOAD_CONTENT_TYPE_MISMATCH: "The uploaded file type did not match the selected document.",
  DOCUMENT_UPLOAD_STATE_CONFLICT: "The upload status changed. Refresh and try again.",
  RESULT_NOT_READY: "Your result is still being prepared.",
  RESULT_UNAVAILABLE: "This result could not be loaded. Please try again.",
};

/** Never surfaces raw API errors, JSON, XML or tokens. */
export function friendlyDocumentError(error: unknown): string {
  if (error instanceof DirectUploadError) {
    if (error.kind === "forbidden")
      return "The secure upload could not be authorised. Please try again.";
    if (error.kind === "network")
      return "The upload was interrupted. Check your connection and try again.";
    return "We could not upload this document. Please try again.";
  }
  if (error instanceof ApiError && error.code && CODE_MESSAGES[error.code]) {
    return CODE_MESSAGES[error.code]!;
  }
  if (error instanceof ApiError && error.status === 0) {
    return "The upload was interrupted. Check your connection and try again.";
  }
  return "We could not prepare this document. Please try again.";
}

export type DocumentUploadStatus = "UPLOADED" | "VALIDATING" | "ACCEPTED";

export type DocumentProcessingStatus =
  | "QUEUED"
  | "DETECTING_MODULE"
  | "CLASSIFYING"
  | "EXTRACTING"
  | "VALIDATING_RESULT"
  | "MATCHING_RULES"
  | "COMPLETED"
  | "NEEDS_REVIEW"
  | "FAILED"
  | "CANCELLED";

export type CompleteUploadResponse = {
  success: true;
  data: {
    document: {
      id: string;
      uploadStatus: DocumentUploadStatus;
      processingStatus: DocumentProcessingStatus;
      uploadedAt: string | null;
    };
    verification: {
      sizeBytes: number;
      contentType: string;
      eTag: string | null;
      lastModified: string | null;
    };
    processing: {
      queued: boolean;
      jobId: string | null;
      jobType: "VALIDATE_DOCUMENT_UPLOAD";
    };
  };
};

/** Verifies the uploaded object with the backend. No request body is sent. */
export async function completeUpload(documentId: string): Promise<CompleteUploadResponse> {
  return apiRequest<CompleteUploadResponse>(`/api/v1/documents/${documentId}/upload-complete`, {
    method: "POST",
  });
}

export type DocumentFailureCode =
  | "DOCUMENT_NOT_SUPPORTED"
  | "MODULE_NOT_ACTIVE"
  | "JURISDICTION_NOT_SUPPORTED"
  | "MODULE_DETECTION_LOW_CONFIDENCE";

export type DocumentStatusView = {
  id: string;
  uploadStatus: DocumentUploadStatus;
  processingStatus: DocumentProcessingStatus;
  detectedModule: string | null;
  detectedDocumentType: string | null;
  failureCode: DocumentFailureCode | string | null;
  failureMessage: string | null;
  uploadedAt: string | null;
  updatedAt: string;
};

/** GET /api/v1/documents/:id/status returns data.status (NOT data.document). */
export type GetDocumentStatusResponse = {
  success: true;
  data: {
    status: DocumentStatusView;
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
};

/** Converts a backend UPPER_SNAKE_CASE value into readable Title Case for display only. */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getDocumentStatus(documentId: string): Promise<GetDocumentStatusResponse> {
  return apiRequest<GetDocumentStatusResponse>(`/api/v1/documents/${documentId}/status`, {
    method: "GET",
  });
}

export const TERMINAL_PROCESSING_STATUSES: DocumentProcessingStatus[] = [
  "COMPLETED",
  "NEEDS_REVIEW",
  "FAILED",
  "CANCELLED",
];

export function isTerminalProcessingStatus(status: DocumentProcessingStatus): boolean {
  return TERMINAL_PROCESSING_STATUSES.includes(status);
}

const PROCESSING_COPY: Record<DocumentProcessingStatus, { title: string; body: string }> = {
  QUEUED: { title: "Your document is queued", body: "Untangle is preparing it for analysis." },
  DETECTING_MODULE: { title: "Identifying document type", body: "Working out what this document is." },
  CLASSIFYING: { title: "Classifying your document", body: "Sorting it into the right category." },
  EXTRACTING: { title: "Extracting key details", body: "Pulling out dates, amounts and names." },
  VALIDATING_RESULT: { title: "Checking the details", body: "Making sure what we found is correct." },
  MATCHING_RULES: { title: "Checking your rights", body: "Matching the document against known rules." },
  COMPLETED: { title: "Your document is ready", body: "Untangle has finished reading it." },
  NEEDS_REVIEW: { title: "This one needs a closer look", body: "Some details could not be confirmed automatically." },
  FAILED: { title: "We could not read this document", body: "Something went wrong while processing it." },
  CANCELLED: { title: "Processing was cancelled", body: "This document was not processed." },
};

export function processingCopy(status: DocumentProcessingStatus) {
  return PROCESSING_COPY[status];
}
