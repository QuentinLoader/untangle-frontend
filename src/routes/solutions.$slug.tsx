import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { PrimaryButton } from "@/components/untangle/Buttons";
import { findSolution, SOLUTIONS } from "@/lib/solutions";

export const Route = createFileRoute("/solutions/$slug")({
  head: ({ params }) => {
    const solution = findSolution(params.slug);
    const title = solution ? `${solution.name} — Untangle` : "Solution — Untangle";
    const description = solution?.description ?? "Untangle products for important documents.";
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
        <h1 className="font-display text-[22px] font-semibold text-ink">Product not found</h1>
        <p className="mt-2 text-[14px] text-ink-soft">This Untangle product does not exist yet.</p>
        <Link to="/" className="mt-6 inline-block text-[14px] font-semibold text-teal">
          Back to Untangle
        </Link>
      </div>
    </div>
  );
}

function SolutionDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const solution = findSolution(slug) ?? SOLUTIONS[0]!;
  const Icon = solution.icon;
  const available = solution.status === "AVAILABLE" && solution.operational;

  return (
    <div className="min-h-screen bg-paper px-5 pt-6 pb-[104px]">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          aria-label="Back to Untangle"
          className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors active:bg-paper-2"
        >
          <ArrowLeft size={20} aria-hidden />
        </Link>

        <div className="mt-3 flex items-start gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-teal"
            style={{ backgroundColor: solution.tint }}
            aria-hidden
          >
            <Icon size={24} strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[26px] font-semibold leading-tight text-ink">
              {solution.name}
            </h1>
            <p className="mt-1 text-[13.5px] text-ink-soft">{solution.shortDescription}</p>
            {!available ? (
              <span className="mt-2 inline-block rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                Coming soon
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-ink">{solution.description}</p>

        {available ? (
          <div className="mt-6">
            <PrimaryButton
              onClick={() => navigate({ to: "/upload", search: { solution: solution.slug } })}
            >
              Upload a document
            </PrimaryButton>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-line/70 bg-white p-5">
            <p className="text-[15px] font-semibold text-ink">Not available yet</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
              {solution.name} is part of the Untangle suite but cannot analyse documents yet. It is
              shown here so you know what is coming.
            </p>
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-[13px] font-semibold text-ink-soft">
            {available ? "What it helps you understand" : "What it will help you understand"}
          </h2>
          <ul className="mt-3 space-y-3">
            {solution.helps.map((item) => (
              <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-ink">
                <Check size={17} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[13px] font-semibold text-ink-soft">Documents it covers</h2>
          <ul className="mt-3 space-y-2">
            {solution.documentExamples.map((item) => (
              <li key={item} className="text-[13.5px] leading-relaxed text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl bg-paper-2/70 p-4">
          <h2 className="text-[13px] font-semibold text-ink">Reference framework</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
            Guidance is grounded in the document itself and: {solution.groundedIn.join(", ")}.
          </p>
          {solution.scopeNote ? (
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{solution.scopeNote}</p>
          ) : null}
        </section>
      </div>
      <BottomTabBar active="Home" />
    </div>
  );
}
