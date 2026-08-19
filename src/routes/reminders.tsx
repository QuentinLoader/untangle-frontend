import { createFileRoute } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { RemindersList } from "@/components/untangle/RemindersList";

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
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-[21px] font-semibold text-ink">Reminders</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Deadlines from your documents, before they pass.
        </p>
        <RemindersList from="reminders" />
      </div>
      <BottomTabBar active="Reminders" />
    </div>
  );
}
