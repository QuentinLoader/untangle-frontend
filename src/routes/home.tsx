import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronRight, Clock, FileText, Upload } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
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
        content: "Your Untangle South Africa home for documents, actions and specialist tools.",
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
  const { entitlements, error: entitlementsError } = useEntitlements();
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
      });
      return;
    }

    navigate({ to: "/vault" });
  };

  return (
    <AppShell active="Home" planLabel={entitlements?.isPlus ? "Plus" : "Free"}>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,760px)_minmax(280px,1fr)]">
        <div className="min-w-0">
          <section>
            <p className="text-[13px] font-medium text-ink-soft">Untangle South Africa</p>
            <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
              {greeting(new Date())}
              {name ? ", " + name : ""}
            </h1>
            <p className="mt-2 max-w-2xl text-[15.5px] leading-7 text-ink-soft">
              Understand an important document, see what needs your attention and know what to do
              next.
            </p>
          </section>

          {entitlementsError ? (
            <div className="mt-6 border-l-4 border-stamp-amber bg-amber-50 px-4 py-3">
              <p className="text-[14px] font-semibold text-ink">
                We cannot reach the service right now
              </p>
              <p className="mt-1 text-[13px] leading-5 text-ink-soft">
                You can still move around the app, but new documents and account features may be
                unavailable until the connection returns.
              </p>
            </div>
          ) : null}

          {attention ? (
            <section className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-stamp-amber">
                    Needs your attention
                  </p>
                  <h2 className="mt-1 text-[19px] font-semibold text-ink">
                    {attention.reminder.label}
                  </h2>
                </div>
                <Clock size={20} className="shrink-0 text-stamp-amber" aria-hidden />
              </div>
              <button
                type="button"
                onClick={() => navigate({ to: "/reminders" })}
                className="mt-3 flex w-full items-center justify-between gap-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-4 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-medium text-ink">
                    {reminderDocumentTitle(attention.reminder)}
                  </span>
                  <span className="mt-1 block text-[12.5px] text-ink-soft">
                    {attention.statusLabel}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
              </button>
            </section>
          ) : null}

          <section className="mt-8 rounded-[18px] border border-line bg-white px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-dim text-teal">
                <Upload size={21} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[19px] font-semibold text-ink">Understand a document</h2>
                <p className="mt-1.5 max-w-xl text-[14px] leading-6 text-ink-soft">
                  Upload a document and Untangle will identify the supported specialist experience
                  and explain what matters.
                </p>
                <Link
                  to="/upload"
                  className="mt-4 inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-teal px-4 text-[14px] font-semibold text-white"
                >
                  Upload a document
                  <ArrowRight size={17} aria-hidden />
                </Link>
              </div>
            </div>
          </section>

          {recent.length > 0 ? (
            <section className="mt-9">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                    Your recent checks
                  </p>
                  <h2 className="mt-1 text-[20px] font-semibold text-ink">
                    Pick up where you left off
                  </h2>
                </div>
                <Link to="/vault" className="text-[13px] font-semibold text-teal">
                  All documents
                </Link>
              </div>
              <div className="mt-3 rounded-[14px] border border-line bg-white px-4">
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

          <section className="mt-9">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              Specialist tools
            </p>
            <h2 className="mt-1 text-[20px] font-semibold text-ink">
              Choose the problem you are dealing with
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SOLUTION_LIST.map((solution) => {
                const Icon = solution.icon;
                return (
                  <Link
                    key={solution.slug}
                    to="/solutions/$slug"
                    params={{ slug: solution.slug }}
                    className="flex min-h-[112px] items-start gap-3 rounded-[14px] border border-line bg-white p-4 transition-colors hover:bg-paper-2"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-teal"
                      style={{ backgroundColor: solution.tint }}
                    >
                      <Icon size={19} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold text-ink">{solution.name}</span>
                        {solution.status !== "AVAILABLE" ? (
                          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                            Coming soon
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1.5 block text-[12.5px] leading-5 text-ink-soft">
                        {solution.shortDescription}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="min-w-0">
          <div className="xl:sticky xl:top-[104px]">
            <section className="rounded-[16px] border border-line bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                Learn before you commit or respond
              </p>
              <h2 className="mt-2 text-[18px] font-semibold text-ink">
                Small things can have a big impact
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[14px] font-semibold text-ink">Balloon payments</p>
                  <p className="mt-1 text-[13px] leading-5 text-ink-soft">
                    A lower monthly payment can still leave a large amount due at the end.
                  </p>
                </div>
                <div className="border-t border-line pt-4">
                  <p className="text-[14px] font-semibold text-ink">
                    Deadlines in official notices
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-ink-soft">
                    The important date is not always the date printed at the top of the letter.
                  </p>
                </div>
                <div className="border-t border-line pt-4">
                  <p className="text-[14px] font-semibold text-ink">Insurance wording</p>
                  <p className="mt-1 text-[13px] leading-5 text-ink-soft">
                    Benefits described in general wording are not always benefits you actually
                    purchased.
                  </p>
                </div>
              </div>
            </section>

            <p className="mt-4 px-1 text-[11.5px] leading-5 text-ink-soft">
              Untangle South Africa is an AddVision product.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
