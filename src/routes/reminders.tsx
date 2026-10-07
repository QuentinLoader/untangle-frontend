import { createFileRoute } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { AppShell } from "@/components/untangle/v2/AppShell";
import { ReminderTimeline } from "@/components/untangle/ReminderTimeline";
import { useEntitlements } from "@/hooks/useEntitlements";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — Untangle South Africa" },
      { name: "description", content: "Important dates from your Untangle documents." },
      { property: "og:title", content: "Reminders — Untangle South Africa" },
      { property: "og:description", content: "Important dates from your Untangle documents." },
    ],
  }),
  component: withAuth(Reminders),
});

function Reminders() {
  const { entitlements } = useEntitlements();

  return (
    <AppShell active="Reminders" planLabel={entitlements?.planLabel ?? "Account"}>
      <div className="mx-auto w-full max-w-[860px]">
        <header>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink">Reminders</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-ink-soft">
            Important dates from your documents, in one place.
          </p>
        </header>

        <div className="mt-6">
          <ReminderTimeline from="reminders" />
        </div>
      </div>
    </AppShell>
  );
}
