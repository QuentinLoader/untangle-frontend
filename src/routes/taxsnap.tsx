import { createFileRoute } from "@tanstack/react-router";
import { PublicSpecialistLanding } from "@/components/untangle/public/PublicSpecialistLanding";

export const Route = createFileRoute("/taxsnap")({
  head: () => ({
    meta: [
      { title: "TaxSnap — Understand what SARS wants from you" },
      {
        name: "description",
        content:
          "Upload a SARS letter, notice or assessment. TaxSnap explains what it is, what SARS wants, important dates and what to do next.",
      },
      { property: "og:title", content: "TaxSnap — Understand what SARS wants from you" },
      {
        property: "og:description",
        content: "SARS letters and notices explained in plain language for South Africans.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/taxsnap" }],
  }),
  component: TaxSnapPublicPage,
});

function TaxSnapPublicPage() {
  return <PublicSpecialistLanding product="taxsnap" />;
}
