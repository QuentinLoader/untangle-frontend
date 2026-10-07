import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronRight, Clock, FileText, Upload } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import { PageState } from "@/components/untangle/v2/PageState";
import { AppShell } from "@/components/untangle/v2/AppShell";
import { useAuth } from "@/auth/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { firstName, resolveDisplayName } from "@/lib/display-name";
import { SOLUTION_LIST } from "@/lib/solutions";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  listDocuments,
  moduleLabel,
  type DocumentListItem,
} from "@/lib/documents";
import { listReminders, reminderDocumentTitle, reminderView } from "@/lib/reminders";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Untangle South Africa" },
      {
        name: "description",
        content:
          "Choose a specialist tool, continue a recent document or see what needs attention.",
      },
    ],
  }),
  component: withAuth(HomePage),
});

const PROCESSING = new Set([
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

function RecentDocumentRow({
  document,
  onOpen,
}: {
  document: DocumentListItem;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 border-t border-line/80 py-3.5 text-left first:border-t-0"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper-2 text-teal">
        <FileText size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-ink">
          {documentDisplayTitle(document)}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-ink-soft">
          {moduleLabel(document.module)} · {documentStatusSubtitle(document)}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
    </button>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const {
    entitlements,
    isPending: accessPending,
    error: entitlementsError,
    refetch: retryAccess,
  } = useEntitlements();
  const name = firstName(resolveDisplayName(profile, user));

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => listReminders(),
    retry: false,
    enabled: entitlements?.remindersEnabled === true,
  });

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocuments(),
    retry: false,
    enabled: entitlements?.vaultEnabled === true,
  });

  const attention = (remindersQuery.data?.data.reminders ?? [])
    .map(reminderView)
    .filter((view) => view.state === "DUE" || view.state === "UPCOMING")
    .sort((a, b) => {
      if (a.state !== b.state) return a.state === "DUE" ? -1 : 1;
      return new Date(a.effectiveDate ?? 0).getTime() - new Date(b.effectiveDate ?? 0).getTime();
    })[0];

  const recent = [...(documentsQuery.data?.data.documents ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const openDocument = (document: DocumentListItem) => {
    if (document.processingStatus === "COMPLETED") {
      navigate({
        to: "/result",
        search: { documentId: document.documentId, from: "home" as const },
      });
      return;
    }

    if (PROCESSING.has(document.processingStatus)) {
      navigate({
        to: "/processing/$documentId",
        params: { documentId: document.documentId },
        search: {},
      });
      return;
    }

    navigate({ to: "/vault" });
  };

  return (
    <AppShell active="Home" planLabel={entitlements?.planLabel ?? "Account"}>
      <div className="mx-auto w-full max-w-[940px]">
        <section>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
            {greeting(new Date())}
            {name ? ", " + name : ""}
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-ink-soft">
            What do you want to understand?
          </p>
        </section>

        {attention ? (
          <section className="mt-7">
            <button
              type="button"
              onClick={() => navigate({ to: "/reminders" })}
              className="flex w-full items-center justify-between gap-4 border-y border-amber-200 bg-amber-50/70 px-4 py-3.5 text-left"
            >
              <span className="flex min-w-0 items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-stamp-amber">
                    Needs your attention
                  </span>
                  <span className="mt-1 block truncate text-[14px] font-semibold text-ink">
                    {attention.reminder.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-ink-soft">
                    {reminderDocumentTitle(attention.reminder)} · {attention.statusLabel}
                  </span>
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
            </button>
          </section>
        ) : null}

        <section className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {SOLUTION_LIST.map((solution) => {
              const Icon = solution.icon;
              const isTax = solution.slug === "taxsnap";
              const isLease = solution.slug === "leasecheck";
              const accent = isTax ? "var(--stamp-red)" : isLease ? "var(--teal)" : "var(--line)";

              return (
                <Link
                  key={solution.slug}
                  to="/solutions/$slug"
                  params={{ slug: solution.slug }}
                  className="group min-h-[118px] border border-line bg-white px-4 py-4 transition-colors hover:bg-paper-2"
                  style={{ borderTopWidth: 3, borderTopColor: accent }}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ backgroundColor: solution.tint, color: accent }}
                      aria-hidden
                    >
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[16px] font-semibold text-ink">{solution.name}</span>
                        {solution.status !== "AVAILABLE" ? (
                          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                            Coming soon
                          </span>
                        ) : (
                          <ArrowRight
                            size={16}
                            className="text-ink-soft transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        )}
                      </span>
                      <span className="mt-1.5 block text-[12.5px] leading-5 text-ink-soft">
                        {solution.shortDescription}
                      </span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          <Link
            to="/upload"
            search={{}}
            className="flex min-h-[62px] items-center justify-between gap-4 border-y border-line bg-white px-4 py-3 transition-colors hover:bg-paper-2"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-dim text-teal">
                <Upload size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-ink">
                  Not sure which tool?
                </span>
                <span className="mt-0.5 block text-[12.5px] text-ink-soft">
                  Upload the document and Untangle will identify the supported specialist.
                </span>
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
          </Link>
        </section>

        {accessPending ? (
          <PageState
            title="Checking your account…"
            body="Loading your available features."
            loading
          />
        ) : null}
        {entitlementsError ? (
          <PageState
            title="Account features could not be loaded"
            body="Try again to load your documents and reminders."
            onRetry={() => void retryAccess()}
          />
        ) : null}
        {entitlements?.vaultEnabled && documentsQuery.isPending ? (
          <PageState
            title="Loading recent documents…"
            body="Checking where you left off."
            loading
          />
        ) : null}
        {entitlements?.vaultEnabled && documentsQuery.error ? (
          <PageState
            title="Recent documents could not be loaded"
            body="Your documents are still saved. Try again."
            onRetry={() => void documentsQuery.refetch()}
          />
        ) : null}
        {entitlements?.remindersEnabled && remindersQuery.error ? (
          <PageState
            title="Reminders could not be loaded"
            body="Try again to check important dates."
            onRetry={() => void remindersQuery.refetch()}
          />
        ) : null}
        {entitlements?.vaultEnabled && documentsQuery.isSuccess && recent.length === 0 ? (
          <PageState
            title="No documents yet"
            body="Start with a specialist above. Your saved analyses will appear here."
          />
        ) : null}
        {entitlements?.vaultEnabled && recent.length > 0 ? (
          <section className="mt-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Recent documents
                </p>
                <h2 className="mt-1 text-[19px] font-semibold text-ink">
                  Continue where you left off
                </h2>
              </div>
              <Link to="/vault" className="min-h-11 py-3 text-[13px] font-semibold text-teal">
                All documents
              </Link>
            </div>

            <div className="mt-3 border-y border-line bg-white px-4">
              {recent.map((document) => (
                <RecentDocumentRow
                  key={document.documentId}
                  document={document}
                  onOpen={() => openDocument(document)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
