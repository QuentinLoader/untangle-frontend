import { createFileRoute, notFound } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import {
  GenericSolutionEntry,
  LeaseCheckEntry,
  TaxSnapEntry,
} from "@/components/untangle/v2/SpecialistEntryPage";
import { findSolution, SOLUTIONS } from "@/lib/solutions";

export const Route = createFileRoute("/solutions/$slug")({
  head: ({ params }) => {
    const solution = findSolution(params.slug);
    const title = solution
      ? `${solution.name} — Untangle South Africa`
      : "Product — Untangle South Africa";
    const description =
      solution?.description ?? "Untangle South Africa products for important documents.";

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
  component: withAuth(SolutionDetail),
});

function SolutionDetail() {
  const { slug } = Route.useParams();
  const solution = findSolution(slug) ?? SOLUTIONS[0]!;

  if (solution.slug === "taxsnap") {
    return <TaxSnapEntry solution={solution} />;
  }

  if (solution.slug === "leasecheck") {
    return <LeaseCheckEntry solution={solution} />;
  }

  return <GenericSolutionEntry solution={solution} />;
}
