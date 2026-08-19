import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DocCard } from "@/components/untangle/DocCard";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { FAB } from "@/components/untangle/FAB";
import { useAuth } from "@/auth/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  friendlyDocumentError,
  listDocuments,
  moduleLabel,
  type DocumentListItem,
} from "@/lib/documents";
import {
  getLatestSentOccurrence,
  getNextScheduledOccurrence,
  listReminders,
} from "@/lib/reminders";
import { usageLine } from "@/lib/entitlements";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your documents — Untangle" },
      {
        name: "description",
        content:
          "See your SARS letters, leases and job offers explained in plain English, with deadlines you won't miss.",
      },
      { property: "og:title", content: "Your documents — Untangle" },
      {
        property: "og:description",
        content: "Plain-English explanations and deadline reminders for your official documents.",
      },
    ],
  }),
  component: withAuth(Index),
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

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

function firstName(value: string | null | undefined): string | null {
  const name = value?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0] ?? null;
}

function Index() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { entitlements } = useEntitlements();

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocuments(),
    retry: false,
  });

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => listReminders(),
    retry: false,
    enabled: entitlements ? entitlements.remindersEnabled : false,
  });

  const documents = documentsQuery.data?.data.documents ?? [];
  const recent = documents.slice(0, 5);

  const reminders = remindersQuery.data?.data.reminders ?? [];
  const dueCount = reminders.filter((r) => getLatestSentOccurrence(r)).length;
  const upcomingCount = reminders.filter(
    (r) => !getLatestSentOccurrence(r) && getNextScheduledOccurrence(r),
  ).length;

  const name = firstName(profile?.displayName) ?? firstName(user?.email?.split("@")[0]) ?? null;
  const usage = entitlements ? usageLine(entitlements) : null;

  const openDocument = (doc: DocumentListItem) => {
    if (doc.processingStatus === "COMPLETED") {
      navigate({ to: "/result", search: { documentId: doc.documentId, from: "home" as const } });
      return;
    }
    if (PROCESSING_STATUSES.has(doc.processingStatus)) {
      navigate({ to: "/processing/$documentId", params: { documentId: doc.documentId } });
    }
  };

  const isOpenable = (doc: DocumentListItem) =>
    doc.processingStatus === "COMPLETED" || PROCESSING_STATUSES.has(doc.processingStatus);

  const reminderBanner =
    dueCount > 0
      ? `⏰ ${dueCount} reminder${dueCount === 1 ? "" : "s"} due — tap to see`
      : upcomingCount > 0
        ? `⏰ ${upcomingCount} upcoming reminder${upcomingCount === 1 ? "" : "s"} — tap to see`
        : null;

  return (
    <div className="min-h-screen bg-paper pb-[150px]">
      <div className="mx-auto max-w-md px-5 pt-8">
        <header>
          <h1 className="font-display text-[21px] font-semibold text-ink">Untangle</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            {greeting(new Date())}
            {name ? `, ${name}` : ""}
          </p>
        </header>

        {reminderBanner ? (
          <button
            type="button"
            onClick={() => navigate({ to: "/reminders" })}
            className="mt-4 w-full rounded-[14px] bg-stamp-amber px-4 py-[13px] text-left text-[14px] font-semibold text-white"
          >
            {reminderBanner}
          </button>
        ) : null}

        {usage ? <p className="mt-4 text-[12px] text-ink-soft">{usage}</p> : null}

        <h2 className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
          Your documents
        </h2>

        {documentsQuery.isPending ? (
          <p className="mt-4 text-[14px] text-ink-soft">Loading your documents…</p>
        ) : documentsQuery.error ? (
          <p className="mt-4 text-[14px] text-ink-soft">
            {friendlyDocumentError(documentsQuery.error)}
          </p>
        ) : recent.length === 0 ? (
          <div className="mt-6 rounded-[14px] border border-dashed border-line p-5 text-center">
            <p className="text-[15px] font-bold text-ink">No documents yet</p>
            <p className="mt-2 text-[13px] text-ink-soft">
              Upload a letter, lease or offer and Untangle will explain it in plain English.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {recent.map((doc) => {
              const visual = MODULE_ICON[moduleLabel(doc.module)] ?? MODULE_ICON['Other']!;
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
        )}
      </div>

      <FAB />
      <BottomTabBar active="Home" />
    </div>
  );
}
