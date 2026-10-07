import { createFileRoute } from "@tanstack/react-router";
import { PublicSpecialistLanding } from "@/components/untangle/public/PublicSpecialistLanding";

export const Route = createFileRoute("/leasecheck")({
  head: () => ({
    meta: [
      { title: "LeaseCheck — Understand the agreement before you sign" },
      {
        name: "description",
        content:
          "LeaseCheck explains payments, responsibilities, important clauses and what happens if a South African lease or agreement changes, ends or goes wrong.",
      },
      { property: "og:title", content: "LeaseCheck — Understand the agreement before you sign" },
      {
        property: "og:description",
        content: "Property, vehicle and equipment agreements explained in plain language.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/leasecheck" }],
  }),
  component: LeaseCheckPublicPage,
});

function LeaseCheckPublicPage() {
  return <PublicSpecialistLanding product="leasecheck" />;
}
