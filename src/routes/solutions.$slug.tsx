import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Scale } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { findSolution, SOLUTIONS } from "@/lib/solutions";

export const Route = createFileRoute("/solutions/$slug")({
  head: ({ params }) => {
    const solution = findSolution(params.slug);
    const title = solution ? `${solution.name} — Untangle` : "Solution — Untangle";
    const description = solution?.shortDescription ?? "Untangle solutions for important documents.";
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
        <p className="mt-2 text-[14px] text-ink-soft">This Untangle solution does not exist yet.</p>
        <Link to="/" className="mt-6 inline-block text-[14px] font-semibold text-teal">← Back to Untangle</Link>
      </div>
    </div>
  );
}

function SolutionDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const solution = findSolution(slug) ?? SOLUTIONS[0]!;
  const available = solution.status === "AVAILABLE";

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="text-[13px] font-semibold text-ink-soft">← Untangle</Link>

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
              <h2 className="mt-4 text-[16px] font-bold leading-snug text-ink">{solution.headline}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{solution.shortDescription}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {solution.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-paper-2 px-2.5 py-1 text-[10.5px] text-ink-soft">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {available ? (
          <div className="mt-4">
            <PrimaryButton onClick={() => navigate({ to: "/upload", search: { solution: solution.slug } })}>
              <span className="inline-flex items-center justify-center gap-2">
                Analyse with {solution.name}
                <ArrowRight size={16} aria-hidden />
              </span>
            </PrimaryButton>
          </div>
        ) : null}

        <section className="mt-6 rounded-[16px] border border-line bg-white p-4">
          <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            {available ? "How it helps" : "What it will help with"}
          </h2>
          <ul className="mt-3 space-y-3">
            {solution.helps.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded-[16px] border border-line bg-white p-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-teal" aria-hidden />
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">Documents</h2>
          </div>
          <ul className="mt-3 space-y-2">
            {solution.documentExamples.map((item) => (
              <li key={item} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                <span className="text-teal" aria-hidden>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {solution.scopeNote ? (
          <div className="mt-4 rounded-[14px] border border-line bg-paper-2 px-4 py-3">
            <p className="text-[12.5px] leading-relaxed text-ink-soft">{solution.scopeNote}</p>
          </div>
        ) : null}

        <section className="mt-4 rounded-[16px] border border-line bg-white p-4">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-teal" aria-hidden />
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">Reference framework</h2>
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
            Guidance is intended to be grounded in the relevant source documents and these South African frameworks:
          </p>
          <ul className="mt-3 space-y-1.5">
            {solution.groundedIn.map((item) => (
              <li key={item} className="text-[12px] leading-relaxed text-ink">• {item}</li>
            ))}
          </ul>
        </section>

        {available ? (
          <Link to="/vault" className="mt-5 block text-center text-[13px] font-semibold text-teal">
            View your analysed documents in Vault →
          </Link>
        ) : (
          <>
            <div className="mt-5 rounded-[14px] border border-dashed border-line bg-white/60 p-4">
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {solution.name} is part of the planned Untangle suite. It is visible now so you can see what assistance is coming, but analysis is not enabled yet.
              </p>
            </div>
            <div className="mt-3">
              <SecondaryButton onClick={() => navigate({ to: "/" })}>Back to Untangle</SecondaryButton>
            </div>
          </>
        )}
      </div>
      <BottomTabBar active="Home" />
    </div>
  );
}
