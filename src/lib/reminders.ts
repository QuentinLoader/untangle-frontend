import { apiRequest, ApiError } from "./api-client";

export type ReminderStatus = "SCHEDULED" | "SENT" | "CANCELLED";

export type ReminderOccurrenceStatus = "SCHEDULED" | "SENT" | "SKIPPED" | "CANCELLED";

export type ReminderOccurrence = {
  occurrenceId: string;
  offsetLabel?: string | null;
  scheduledFor: string;
  sentAt?: string | null;
  status: ReminderOccurrenceStatus;
};

export type ReminderDocument = {
  documentId?: string;
  documentTitle?: string | null;
  documentType?: string | null;
  originalFilename?: string | null;
};

export type Reminder = {
  reminderId: string;
  documentId: string;
  label: string;
  dueDate: string;
  deadlineKey: string | null;
  status: ReminderStatus;
  createdAt: string;
  confirmedDeadline?: string | null;
  occurrences?: ReminderOccurrence[];
  document?: ReminderDocument | null;
};


export type CreateReminderRequest = {
  documentId: string;
  label: string;
  dueDate: string;
  deadlineKey?: string | null;
};

export type CreateReminderResponse = {
  success: true;
  data: { reminder: Reminder };
  meta?: { requestId: string; timestamp: string };
};

export type ListRemindersResponse = {
  success: true;
  data: { reminders: Reminder[] };
  meta?: { requestId: string; timestamp: string };
};

/** POST /api/v1/reminders */
export async function createReminder(
  input: CreateReminderRequest,
): Promise<CreateReminderResponse> {
  return apiRequest<CreateReminderResponse>("/api/v1/reminders", {
    method: "POST",
    body: JSON.stringify({
      documentId: input.documentId,
      label: input.label,
      dueDate: input.dueDate,
      ...(input.deadlineKey ? { deadlineKey: input.deadlineKey } : {}),
    }),
  });
}

/** GET /api/v1/reminders */
export async function listReminders(): Promise<ListRemindersResponse> {
  return apiRequest<ListRemindersResponse>("/api/v1/reminders", { method: "GET" });
}

const REMINDER_CODE_MESSAGES: Record<string, string> = {
  REMINDER_DATE_INVALID: "That date could not be used. Please choose a valid future date.",
  REMINDER_DATE_IN_PAST: "That date has already passed. Please choose a future date.",
  REMINDER_ALREADY_EXISTS: "A reminder already exists for this deadline.",
  REMINDER_LIMIT_REACHED: "You have reached the reminder limit for this document.",
  DOCUMENT_NOT_FOUND: "We could not find this document.",
  RESULT_NOT_READY: "Your result is still being prepared.",
};

/** Never surfaces raw API errors, JSON or tokens. */
export function friendlyReminderError(error: unknown): string {
  if (error instanceof ApiError && error.code && REMINDER_CODE_MESSAGES[error.code]) {
    return REMINDER_CODE_MESSAGES[error.code]!;
  }
  if (error instanceof ApiError && error.status === 0) {
    return "We could not connect. Check your connection and try again.";
  }
  return "We could not save this reminder. Please try again.";
}

export function formatReminderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isFutureDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime();
}
