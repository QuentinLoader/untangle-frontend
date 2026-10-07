import { createFileRoute } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { AppShell } from "@/components/untangle/v2/AppShell";
import { ScreenHeader } from "@/components/untangle/ScreenHeader";
import { ReminderTimeline } from "@/components/untangle/ReminderTimeline";
import { useEntitlements } from "@/hooks/useEntitlements";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — Untangle South Africa" },
      { name: "description", content: "Deadlines from your documents, before they pass." },
      { property: "og:title", content: "Reminders — Untangle South Africa" },
      { property: "og:description", content: "Deadlines from your documents, before they pass." },
    ],
  }),
  component: withAuth(Reminders),
});

function Reminders() {
  const { entitlements } = useEntitlements();

  return (
    <AppShell active="Reminders" planLabel={entitlements?.isPlus ? "Plus" : "Free"}>
      <div className="mx-auto w-full max-w-3xl">
        <ScreenHeader
          title="Reminders"
          subtitle="Deadlines Untangle found and reminders you’ve added."
        />
        <div className="mt-6">
          <ReminderTimeline from="reminders" />
        </div>
      </div>
    </AppShell>
  );
}
