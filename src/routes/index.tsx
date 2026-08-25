import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ScanLine } from "lucide-react";
import { DocCard } from "@/components/untangle/DocCard";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { SolutionCard } from "@/components/untangle/SolutionCard";
import { useAuth } from "@/auth/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { SOLUTIONS } from "@/lib/solutions";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  friendlyDocumentError,
  listDocuments,
  moduleLabel,
  type DocumentListItem,
} from "@/lib/documents";
import { listReminders, reminderDocumentTitle, reminderView } from "@/lib/reminders";
import { usageLine } from "@/lib/entitlements";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Untangle — Your document hub" },
      {
        name: "description",
        content:
          "Untangle explains official documents in plain English and keeps track of the deadlines inside them.",
      },
      { property: "og:title", content: "Untangle — Your document hub" },
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
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Only a real profile display name is used — never an email prefix. */
function firstName(value: string | null | undefined): string | null {
  const name = value?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0] ?? null;
}

function Index() {
  const navigate = useNavigate();
  const { profile } = useAuth();
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
  const recent = documents.slice(0, 3);
  const featuredSolution = SOLUTIONS.find((solution) => solution.status === "AVAILABLE") ?? SOLUTIONS[0]!;
  const upcomingSolutions = SOLUTIONS.filter((solution) => solution.slug !== featuredSolution.slug);

  const attention = (remindersQuery.data?.data.reminders ?? [])
    .map(reminderView)
    .filter((v) => v.state === "DUE" || v.state === "UPCOMING")
    .sort((a, b) => {
      if (a.state !== b.state) return a.state === "DUE" ? -1 : 1;
      return (
        new Date(a.effectiveDate ?? 0).getTime() - new Date(b.effectiveDate ?? 0).getTime()
      );
    })
    .slice(0, 3);

  const name = firstName(profile?.displayName);
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

  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="mx-auto max-w-md px-5 pt-8">
        <header>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-teal">
                Untangle
              </p>
              <h1 className="mt-2 font-display text-[26px] font-semibold leading-tight text-ink">
                {greeting(new Date())}
                {name ? `, ${name}` : ""}
              </h1>
            </div>
            <Link
              to="/upgrade"
              className="rounded-full border border-line bg-white px-3 py-2 text-[11.5px] font-bold text-ink shadow-sm"
            >
              {entitlements?.isPlus ? "Plus" : "Free plan"}
            </Link>
          </div>
          <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-ink-soft">
            Understand the document in front of you, know what matters, and keep track of what comes next.
          </p>
        </header>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Your solutions
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">Start with the tool that matches what you need.</p>
            </div>
          </div>

          <div className="mt-3">
            <SolutionCard solution={featuredSolution} featured />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {upcomingSolutions.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/upload" })}
            className="flex w-full items-center gap-3 rounded-[16px] bg-ink px-4 py-4 text-left text-paper shadow-sm transition-transform active:scale-[0.99]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white/10">
              <ScanLine size={20} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">Analyze a document</span>
              <span className="mt-0.5 block text-[12px] text-white/70">
                Upload it once. Untangle detects the right supported solution.
              </span>
            </span>
            <ArrowRight size={17} className="shrink-0" aria-hidden />
          </button>
        </section>

        {attention.length > 0 ? (
          <section className="mt-9">
            <div className="flex items-baseline justify-between">
              <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Needs your attention
              </h2>
              <Link to="/reminders" className="text-[12.5px] font-semibold text-teal">
                All reminders →
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {attention.map((view) => (
                <li key={view.reminder.reminderId}>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/reminders" })}
                    className={`flex w-full items-center gap-3 rounded-[14px] border px-[14px] py-3 text-left ${
                      view.state === "DUE" ? "border-teal bg-teal-dim/40" : "border-line bg-white"
                    }`}
                  >
                    <span className="text-[16px]" aria-hidden>
                      ⏰
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-ink">
                        {view.reminder.label}
                      </span>
                      <span className="block truncate text-[12px] text-ink-soft">
                        {reminderDocumentTitle(view.reminder)}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-teal">
                      {view.statusLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-9">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              Recent activity
            </h2>
            {documents.length > 0 ? (
              <Link to="/vault" className="text-[12.5px] font-semibold text-teal">
                Open Vault →
              </Link>
            ) : null}
          </div>

          {documentsQuery.isPending ? (
            <p className="mt-4 text-[14px] text-ink-soft">Loading your documents…</p>
          ) : documentsQuery.error ? (
            <p className="mt-4 text-[14px] text-ink-soft">
              {friendlyDocumentError(documentsQuery.error)}
            </p>
          ) : recent.length === 0 ? (
            <div className="mt-4 rounded-[16px] border border-dashed border-line bg-white/60 p-5 text-center">
              <p className="text-[15px] font-bold text-ink">Nothing analysed yet</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                TaxSnap is ready for supported SARS documents. Your analyses will appear here.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/solutions/$slug",
                    params: { slug: "taxsnap" },
                  })
                }
                className="mt-4 rounded-full bg-teal px-5 py-[10px] text-[13.5px] font-semibold text-white"
              >
                Open TaxSnap
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {recent.map((doc) => {
                const visual = MODULE_ICON[moduleLabel(doc.module)] ?? MODULE_ICON["Other"]!;
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
        </section>

        {usage ? (
          <div className="mt-8 rounded-[14px] border border-line bg-white px-4 py-3">
            <p className="text-[12.5px] text-ink-soft">
              {usage}{" "}
              {!entitlements?.isPlus ? (
                <Link to="/upgrade" className="font-semibold text-teal">
                  View plan & billing →
                </Link>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>

      <BottomTabBar active="Home" />
    </div>
  );
}
