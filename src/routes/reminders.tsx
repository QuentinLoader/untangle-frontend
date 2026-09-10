import { createFileRoute } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { ScreenHeader } from "@/components/untangle/ScreenHeader";
import { ReminderTimeline } from "@/components/untangle/ReminderTimeline";

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
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[104px]">
      <div className="mx-auto w-full max-w-md">
        <ScreenHeader
          title="Reminders"
          subtitle="Deadlines Untangle found and reminders you’ve added."
        />
        <ReminderTimeline from="reminders" />
      </div>
      <BottomTabBar active="Reminders" />
    </div>
  );
}
