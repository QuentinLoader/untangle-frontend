import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  listDocuments,
  moduleLabel,
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

function SolutionNotFound() {
  return (
    <div className="min-h-screen bg-paper px-5 pt-10">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-[21px] font-semibold text-ink">Solution not found</h1>
        <p className="mt-2 text-[14px] text-ink-soft">
          This Untangle solution does not exist yet.
        </p>
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

  // REAL BACKEND DATA — only for operational solutions with a real module key.
  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocuments(),
    retry: false,
    enabled: available && solution.moduleKey !== null,
  });

  const related = (documentsQuery.data?.data.documents ?? [])
    .filter((doc) => doc.module === solution.moduleKey)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="text-[13px] font-semibold text-ink-soft">
          ← Untangle
        </Link>

        <div className="mt-5 flex items-center gap-3">
          <div
            className="grid h-[44px] w-[44px] place-items-center rounded-[12px] text-[21px]"
            style={{ backgroundColor: solution.tint }}
            aria-hidden
          >
            {solution.icon}
          </div>
          <div>
            <h1 className="font-display text-[24px] font-semibold text-ink">{solution.name}</h1>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2.5 py-[3px] font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] ${
                available ? "bg-teal text-white" : "border border-line bg-paper-2 text-ink-soft"
              }`}
            >
              {available ? "Available" : "Coming soon"}
            </span>
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-ink">{solution.purpose}</p>

        <h2 className="mt-7 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-teal">
          {available ? `${solution.name} can help identify` : "Untangle will help highlight"}
        </h2>
        <ul className="mt-3 space-y-2">
          {solution.helps.map((item) => (
            <li key={item} className="flex gap-2 text-[14px] text-ink">
              <span className="text-teal" aria-hidden>
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7">
          {available ? (
            <PrimaryButton onClick={() => navigate({ to: "/upload" })}>
              Analyse a SARS document
            </PrimaryButton>
          ) : (
            <>
              <div className="rounded-[14px] border border-dashed border-line bg-white/60 p-4">
                <p className="text-[13px] text-ink-soft">
                  {solution.name} is not available yet. Untangle cannot analyse these documents
                  today.
                </p>
              </div>
              <div className="mt-3">
                <SecondaryButton onClick={() => navigate({ to: "/" })}>
                  Back to Untangle
                </SecondaryButton>
              </div>
            </>
          )}
        </div>

        {available && solution.moduleKey ? (
          <section className="mt-9">
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Recent {solution.name} documents
            </h2>
            {documentsQuery.isPending ? (
              <p className="mt-3 text-[13px] text-ink-soft">Loading your documents…</p>
            ) : related.length === 0 ? (
              <p className="mt-3 text-[13px] text-ink-soft">
                Nothing analysed with {solution.name} yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line rounded-[14px] border border-line bg-white">
                {related.map((doc) => (
                  <li key={doc.documentId}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/result",
                          search: { documentId: doc.documentId, from: "home" as const },
                        })
                      }
                      className="block w-full px-[14px] py-3 text-left"
                    >
                      <p className="text-[14px] font-semibold text-ink">
                        {documentDisplayTitle(doc)}
                      </p>
                      <p className="mt-[2px] text-[12px] text-ink-soft">
                        {moduleLabel(doc.module)} · {documentStatusSubtitle(doc)}
                      </p>
                    </button>
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
