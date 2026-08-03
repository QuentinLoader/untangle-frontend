import { createFileRoute } from "@tanstack/react-router";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { DocCard } from "@/components/untangle/DocCard";
import { FAB } from "@/components/untangle/FAB";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Untangle" },
      { name: "description", content: "Every document you've untangled, stored in one place." },
      { property: "og:title", content: "Vault — Untangle" },
      {
        property: "og:description",
        content: "Every document you've untangled, stored in one place.",
      },
    ],
  }),
  component: Vault,
});

function Vault() {
  return (
    <div className="min-h-screen bg-paper pb-[100px]">
      <div className="mx-auto w-full max-w-md px-5 pt-8">
        <h1 className="font-display text-[20px] font-semibold text-ink">Vault</h1>

        <div className="mt-5 flex items-center gap-6 border-b border-line">
          <button className="border-b-2 border-teal pb-2 text-[14px] font-semibold text-ink">
            Documents
          </button>
          <button className="pb-2 text-[14px] font-semibold text-ink-soft">Reminders</button>
        </div>

        <section className="mt-6 space-y-6">
          <div>
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">
              TaxSnap
            </h2>
            <div className="mt-3">
              <DocCard
                icon="📨"
                iconBg="#FBEAE5"
                title="Letter of Demand"
                subtitle="Due 14 Jul"
              />
            </div>
          </div>

          <div>
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">
              LeaseCheck
            </h2>
            <div className="mt-3">
              <DocCard
                icon="🏠"
                iconBg="var(--teal-dim)"
                title="Greenfield Apartments Lease"
                subtitle="Reviewed 12 Jun"
              />
            </div>
          </div>

          <div>
            <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-wide text-ink-soft">
              WorkCheck
            </h2>
            <div className="mt-3">
              <DocCard
                icon="💼"
                iconBg="#F3EBDC"
                title="Offer of Employment"
                subtitle="1 flag · probation clause"
              />
            </div>
          </div>
        </section>
      </div>

      <FAB />
      <BottomTabBar active="Vault" />
    </div>
  );
}
