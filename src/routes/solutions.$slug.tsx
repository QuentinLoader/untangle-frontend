import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  listDocuments,
  moduleLabel,
  type DocumentListItem,
} from "@/lib/documents";
import { findSolution, SOLUTIONS } from "@/lib/solutions";

export const Route = createFileRoute("/solutions/$slug")({
  head: ({ params }) => {
    const solution = findSolution(params.slug);
    const title = solution ? `${solution.name} — Untangle` : "Solution — Untangle";
    const description = solution?.purpose ?? "Untangle solutions for your official documents.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ params }) => {
    if (!findSolution(params.slug)) throw notFound();
  },
  notFoundComponent: SolutionNotFound,
  component: withAuth(SolutionDetail),
});

const PROCESSING_STATUSES = new Set([
  "QUEUED",
  "DETECTING_MODULE",
  "CLASSIFYING",
  "EXTRACTING",
  "VALIDATING_RESULT",
  "MATCHING_RULES",
  "NEEDS_REVIEW",
]);

function SolutionNotFound() {
  return (
    <div className="min-h-screen bg-paper px-5 pt-10">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-[21px] font-semibold text-ink">Solution not found</h1>
        <p className="mt-2 text-[14px] text-ink-soft">This Untangle solution does not exist yet.</p>
        <Link to="/" className="mt-6 inline-block text-[14px] font-semibold text-teal">
          ← Back to Untangle
        </Link>
      </div>
    </div>
  );
}

function SolutionDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const solution = findSolution(slug) ?? SOLUTIONS[0]!;
  const available = solution.status === "AVAILABLE";

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocuments(),
    retry: false,
    enabled: available && solution.moduleKey !== null,
  });

  const related = (documentsQuery.data?.data.documents ?? [])
    .filter((doc) => doc.module === solution.moduleKey)
    .slice(0, 5);

  const openDocument = (doc: DocumentListItem) => {
    if (doc.processingStatus === "COMPLETED") {
      navigate({
        to: "/result",
        search: { documentId: doc.documentId, from: "home" as const },
      });
      return;
    }

    if (PROCESSING_STATUSES.has(doc.processingStatus)) {
      navigate({ to: "/processing/$documentId", params: { documentId: doc.documentId } });
    }
  };

  const isOpenable = (doc: DocumentListItem) =>
    doc.processingStatus === "COMPLETED" || PROCESSING_STATUSES.has(doc.processingStatus);

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="text-[13px] font-semibold text-ink-soft">
          ← Untangle
        </Link>

        <div className="mt-5 rounded-[20px] border border-line bg-white p-5">
          <div className="flex items-start gap-3">
            <div
              className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-[14px] text-[22px]"
              style={{ backgroundColor: solution.tint }}
              aria-hidden
            >
              {solution.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-[24px] font-semibold text-ink">{solution.name}</h1>
                  <p className="mt-1 text-[12.5px] font-medium text-teal">{solution.tagline}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${
                    available ? "bg-teal text-white" : "border border-line bg-paper-2 text-ink-soft"
                  }`}
                >
                  {available ? "Available" : "Coming soon"}
                </span>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{solution.purpose}</p>
            </div>
          </div>
        </div>

        {available ? (
          <section className="mt-6">
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              How {solution.name} works
            </h2>
            <div className="mt-3 grid gap-2">
              <div className="flex gap-3 rounded-[14px] border border-line bg-white px-4 py-3">
                <FileSearch size={18} className="mt-[1px] shrink-0 text-teal" aria-hidden />
                <div>
                  <p className="text-[13.5px] font-bold text-ink">1. Upload the document</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                    PDF or clear photo. Untangle checks that the document belongs to a supported module.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-[14px] border border-line bg-white px-4 py-3">
                <Sparkles size={18} className="mt-[1px] shrink-0 text-teal" aria-hidden />
                <div>
                  <p className="text-[13.5px] font-bold text-ink">2. Untangle reads what matters</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                    Dates, amounts, actions and document-specific details are extracted and checked.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-[14px] border border-line bg-white px-4 py-3">
                <ShieldCheck size={18} className="mt-[1px] shrink-0 text-teal" aria-hidden />
                <div>
                  <p className="text-[13.5px] font-bold text-ink">3. Get a clear result</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                    See the plain-English summary, important actions, risks and reminder-ready deadlines.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-6">
          <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-teal">
            {available ? `${solution.name} can help identify` : "Planned capabilities"}
          </h2>
          <ul className="mt-3 space-y-2">
            {solution.helps.map((item) => (
              <li key={item} className="flex gap-2 text-[13.5px] text-ink">
                <span className="text-teal" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-7">
          {available ? (
            <PrimaryButton
              onClick={() => navigate({ to: "/upload", search: { solution: solution.slug } })}
            >
              <span className="inline-flex items-center justify-center gap-2">
                Analyse with {solution.name}
                <ArrowRight size={16} aria-hidden />
              </span>
            </PrimaryButton>
          ) : (
            <>
              <div className="rounded-[14px] border border-dashed border-line bg-white/60 p-4">
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {solution.name} is visible so you can see where Untangle is going, but it is not yet
                  enabled for analysis.
                </p>
              </div>
              <div className="mt-3">
                <SecondaryButton onClick={() => navigate({ to: "/" })}>Back to Untangle</SecondaryButton>
              </div>
            </>
          )}
        </div>

        {available && solution.moduleKey ? (
          <section className="mt-9">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                Recent {solution.name} activity
              </h2>
              {related.length > 0 ? (
                <Link to="/vault" className="text-[12px] font-semibold text-teal">
                  Vault →
                </Link>
              ) : null}
            </div>
            {documentsQuery.isPending ? (
              <p className="mt-3 text-[13px] text-ink-soft">Loading your documents…</p>
            ) : related.length === 0 ? (
              <p className="mt-3 text-[13px] text-ink-soft">Nothing analysed with {solution.name} yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line rounded-[14px] border border-line bg-white">
                {related.map((doc) => (
                  <li key={doc.documentId}>
                    {isOpenable(doc) ? (
                      <button
                        type="button"
                        onClick={() => openDocument(doc)}
                        className="block w-full px-[14px] py-3 text-left"
                      >
                        <p className="text-[14px] font-semibold text-ink">{documentDisplayTitle(doc)}</p>
                        <p className="mt-[2px] text-[12px] text-ink-soft">
                          {moduleLabel(doc.module)} · {documentStatusSubtitle(doc)}
                        </p>
                      </button>
                    ) : (
                      <div className="px-[14px] py-3">
                        <p className="text-[14px] font-semibold text-ink">{documentDisplayTitle(doc)}</p>
                        <p className="mt-[2px] text-[12px] text-ink-soft">
                          {moduleLabel(doc.module)} · {documentStatusSubtitle(doc)}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
      <BottomTabBar active="Home" />
    </div>
  );
}
