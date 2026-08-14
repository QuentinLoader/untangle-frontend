import { useState } from "react";
import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { DocCard } from "@/components/untangle/DocCard";
import { FAB } from "@/components/untangle/FAB";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  friendlyDocumentError,
  listDocuments,
  moduleLabel,
  type DocumentListItem,
} from "@/lib/documents";
import {
  formatReminderDate,
  friendlyReminderError,
  getLatestSentOccurrence,
  getNextScheduledOccurrence,
  listReminders,
  reminderDocumentTitle,
} from "@/lib/reminders";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Untangle" },
      { name: "description", content: "Every document you've untangled, stored in one place." },
      { property: "og:title", content: "Vault — Untangle" },
      {
        property: "og:description",
        content: "Every document you've untangled, stored in one place.",
      },
    ],
  }),
  component: withAuth(Vault),
});

const MODULE_ICON: Record<string, { icon: string; bg: string }> = {
  TaxSnap: { icon: "📨", bg: "var(--tint-red)" },
  LeaseCheck: { icon: "🏠", bg: "var(--teal-dim)" },
  DealCheck: { icon: "🤝", bg: "var(--tint-sand)" },
  WorkCheck: { icon: "💼", bg: "var(--tint-sand)" },
  Other: { icon: "📄", bg: "var(--paper-2)" },
};

const PROCESSING_STATUSES = new Set([
  "QUEUED",
  "DETECTING_MODULE",
  "CLASSIFYING",
  "EXTRACTING",
  "VALIDATING_RESULT",
  "MATCHING_RULES",
  "NEEDS_REVIEW",
]);

function Vault() {
  const [tab, setTab] = useState<"documents" | "reminders">("documents");
  const navigate = useNavigate();

  const { data, isPending, error } = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocuments(),
    retry: false,
  });

  const documents = data?.data.documents ?? [];

  // Preserve backend ordering (newest first) while grouping by module.
  const groups: Array<{ label: string; docs: DocumentListItem[] }> = [];
  for (const doc of documents) {
    const label = moduleLabel(doc.module);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.docs.push(doc);
    else groups.push({ label, docs: [doc] });
  }

  const openDocument = (doc: DocumentListItem) => {
    if (doc.processingStatus === "COMPLETED") {
      navigate({ to: "/result", search: { documentId: doc.documentId } });
      return;
    }
    if (PROCESSING_STATUSES.has(doc.processingStatus)) {
      navigate({ to: "/processing/$documentId", params: { documentId: doc.documentId } });
    }
  };

  const isOpenable = (doc: DocumentListItem) =>
    doc.processingStatus === "COMPLETED" || PROCESSING_STATUSES.has(doc.processingStatus);

  return (
    <div className="min-h-screen bg-paper pb-[100px]">
      <div className="mx-auto w-full max-w-md px-5 pt-8">
        <h1 className="font-display text-[20px] font-semibold text-ink">Vault</h1>

        <div className="mt-5 flex items-center gap-6 border-b border-line">
          <button
            type="button"
            onClick={() => setTab("documents")}
            className={
              tab === "documents"
                ? "border-b-2 border-teal pb-2 text-[14px] font-semibold text-ink"
                : "pb-2 text-[14px] font-semibold text-ink-soft"
            }
          >
            Documents
          </button>
          <button
            type="button"
            onClick={() => setTab("reminders")}
            className={
              tab === "reminders"
                ? "border-b-2 border-teal pb-2 text-[14px] font-semibold text-ink"
                : "pb-2 text-[14px] font-semibold text-ink-soft"
            }
          >
            Reminders
          </button>
        </div>

        {tab === "reminders" ? (
          <RemindersTab />

        ) : isPending ? (
          <p className="mt-8 text-[14px] text-ink-soft">Loading your documents…</p>
        ) : error ? (
          <p className="mt-8 text-[14px] text-ink-soft">{friendlyDocumentError(error)}</p>
        ) : documents.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-[16px] font-bold text-ink">No documents yet</p>
            <p className="mt-2 text-[13px] text-ink-soft">
              Upload your first document and Untangle will keep it here.
            </p>
          </div>
        ) : (
          <section className="mt-6 space-y-6">
            {groups.map((group) => {
              const visual = MODULE_ICON[group.label] ?? MODULE_ICON['Other']!;
              return (
                <div key={group.label}>
                  <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">
                    {group.label}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {group.docs.map((doc) => {
                      const card = (
                        <DocCard
                          icon={visual.icon}
                          iconBg={visual.bg}
                          title={documentDisplayTitle(doc)}
                          subtitle={documentStatusSubtitle(doc)}
                        />
                      );
                      return isOpenable(doc) ? (
                        <button
                          key={doc.documentId}
                          type="button"
                          onClick={() => openDocument(doc)}
                          className="block w-full text-left"
                        >
                          {card}
                        </button>
                      ) : (
                        <div key={doc.documentId}>{card}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      <FAB />
      <BottomTabBar active="Vault" />
    </div>
  );
}

function RemindersTab() {
  const navigate = useNavigate();
  const { data, isPending, error } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => listReminders(),
    retry: false,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const reminders = data?.data.reminders ?? [];

  if (isPending) return <p className="mt-8 text-[14px] text-ink-soft">Loading your reminders…</p>;
  if (error)
    return <p className="mt-8 text-[14px] text-ink-soft">{friendlyReminderError(error)}</p>;
  if (reminders.length === 0)
    return <p className="mt-8 text-[14px] text-ink-soft">No reminders yet.</p>;

  const rows = reminders.map((reminder) => ({
    reminder,
    sent: getLatestSentOccurrence(reminder),
    next: getNextScheduledOccurrence(reminder),
  }));

  // Due in-app reminders first, then upcoming ones.
  rows.sort((a, b) => {
    if (!!a.sent !== !!b.sent) return a.sent ? -1 : 1;
    if (a.sent && b.sent) {
      return (
        new Date(b.sent.sentAt ?? b.sent.scheduledFor).getTime() -
        new Date(a.sent.sentAt ?? a.sent.scheduledFor).getTime()
      );
    }
    if (a.next && b.next) {
      return new Date(a.next.scheduledFor).getTime() - new Date(b.next.scheduledFor).getTime();
    }
    return a.next ? -1 : b.next ? 1 : 0;
  });

  return (
    <div className="mt-6 space-y-3">
      {rows.map(({ reminder, sent, next }) => {
        const isDue = Boolean(sent);
        const statusLine = sent
          ? `Due now — ${formatReminderDate(sent.sentAt ?? sent.scheduledFor)}`
          : next
            ? `Upcoming — ${formatReminderDate(next.scheduledFor)}`
            : reminder.status === "CANCELLED"
              ? "Reminder cancelled"
              : reminder.occurrences && reminder.occurrences.length > 0
                ? "No upcoming reminders"
                : "Reminder could not be processed";

        return (
          <button
            key={reminder.reminderId}
            type="button"
            onClick={() =>
              navigate({ to: "/result", search: { documentId: reminder.documentId } })
            }
            className={`flex w-full items-center justify-between gap-3 rounded-[14px] border bg-white p-[14px] text-left ${
              isDue ? "border-teal" : "border-line"
            }`}
          >
            <div>
              <p className="text-[14px] font-bold text-ink">{reminder.label}</p>
              <p className="mt-0.5 text-[12px] text-ink-soft">
                {reminderDocumentTitle(reminder)}
              </p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-soft">
                {statusLine}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase ${
                isDue ? "bg-teal text-white" : "bg-teal-dim text-teal"
              }`}
            >
              {isDue ? "Due" : "Upcoming"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

