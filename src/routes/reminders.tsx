import { createFileRoute } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — Untangle" },
      { name: "description", content: "Deadlines from your documents, before they pass." },
      { property: "og:title", content: "Reminders — Untangle" },
      { property: "og:description", content: "Deadlines from your documents, before they pass." },
    ],
  }),
  component: withAuth(Reminders),
});

function Reminders() {
  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[100px]">
      <h1 className="font-display text-[21px] font-semibold">Reminders</h1>
      <p className="mt-2 text-[13px] text-ink-soft">Coming soon.</p>
      <BottomTabBar active="Reminders" />
    </div>
  );
}
