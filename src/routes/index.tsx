import { createFileRoute } from "@tanstack/react-router";
import { DocCard } from "@/components/untangle/DocCard";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { FAB } from "@/components/untangle/FAB";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your documents — Untangle" },
      {
        name: "description",
        content:
          "See your SARS letters, leases and job offers explained in plain English, with deadlines you won't miss.",
      },
      { property: "og:title", content: "Your documents — Untangle" },
      {
        property: "og:description",
        content: "Plain-English explanations and deadline reminders for your official documents.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-paper pb-[150px]">
      <div className="mx-auto max-w-md px-5 pt-8">
        <header>
          <h1 className="font-display text-[21px] font-semibold text-ink">Untangle</h1>
          <p className="mt-1 text-[13px] text-ink-soft">Morning, Thabo</p>
        </header>

        <button className="mt-4 w-full rounded-[14px] bg-stamp-amber px-4 py-[13px] text-left text-[14px] font-semibold text-white">
          ⏰ 2 things due this week — tap to see
        </button>

        <h2 className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
          Your documents
        </h2>

        <div className="mt-3 space-y-3">
          <DocCard
            icon="📨"
            iconBg="#FBEAE5"
            title="SARS Letter of Demand"
            subtitle="R4,200 due 14 Jul"
            stampLabel="Urgent"
            stampColor="red"
          />
          <DocCard
            icon="🏠"
            iconBg="var(--teal-dim)"
            title="Greenfield Apartments Lease"
            subtitle="2 clauses worth knowing about"
            stampLabel="Reviewed"
            stampColor="teal"
          />
          <DocCard
            icon="💼"
            iconBg="#F3EBDC"
            title="Offer of Employment — Nandi Co."
            subtitle="Probation clause flagged"
            stampLabel="Check this"
            stampColor="amber"
          />
        </div>
      </div>

      <FAB />
      <BottomTabBar active="Home" />
    </div>
  );
}
