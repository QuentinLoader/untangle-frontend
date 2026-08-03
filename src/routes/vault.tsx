import { createFileRoute } from "@tanstack/react-router";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";

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
  component: () => (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[100px]">
      <h1 className="font-display text-[21px] font-semibold">Vault</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Coming soon.</p>
      <BottomTabBar active="Vault" />
    </div>
  ),
});
