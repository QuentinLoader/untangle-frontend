import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { BlockCard } from "@/components/untangle/BlockCard";
import { SecondaryButton } from "@/components/untangle/Buttons";
import { useEntitlements } from "@/hooks/useEntitlements";
import { friendlyEntitlementError, usageLine } from "@/lib/entitlements";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Untangle Plus — Untangle" },
      {
        name: "description",
        content: "See what Untangle Plus unlocks: your Vault, deadline reminders and more analyses.",
      },
      { property: "og:title", content: "Untangle Plus — Untangle" },
      {
        property: "og:description",
        content: "See what Untangle Plus unlocks for your documents and deadlines.",
      },
    ],
  }),
  component: withAuth(UpgradePage),
});

function UpgradePage() {
  const navigate = useNavigate();
  const { entitlements, isPending, error } = useEntitlements();

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-[21px] font-semibold text-ink">Untangle Plus</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Keep every document, and never miss a deadline.
        </p>

        <div className="mt-5 space-y-3">
          <BlockCard title="Your plan">
            {isPending ? (
              <p className="text-[13px] text-ink-soft">Checking your plan…</p>
            ) : error ? (
              <p className="text-[13px] text-ink-soft">{friendlyEntitlementError(error)}</p>
            ) : entitlements ? (
              <>
                <p className="text-[15px] font-bold text-ink">{entitlements.planLabel}</p>
                {usageLine(entitlements) ? (
                  <p className="mt-1 text-[13px] text-ink-soft">{usageLine(entitlements)}</p>
                ) : null}
                {entitlements.retentionDays !== null ? (
                  <p className="mt-1 text-[13px] text-ink-soft">
                    Documents are kept for {entitlements.retentionDays} days.
                  </p>
                ) : null}
              </>
            ) : null}
          </BlockCard>

          <BlockCard title="What Plus unlocks">
            <ul className="space-y-2 text-[13px] text-ink">
              <li>🗂️ Your Vault — every document you've untangled, kept together.</li>
              <li>⏰ Deadline reminders before a due date arrives.</li>
              <li>🔔 Browser reminders on the devices you use.</li>
              <li>📄 More document analyses each month.</li>
            </ul>
          </BlockCard>

          {entitlements?.isPlus ? (
            <BlockCard title="Already on Plus">
              <p className="text-[13px] text-ink-soft">
                You're on Untangle Plus — everything above is already switched on.
              </p>
            </BlockCard>
          ) : (
            <BlockCard title="Upgrading">
              <p className="text-[13px] text-ink-soft">
                Upgrades aren't available in the app yet. Your plan is managed by the Untangle team,
                and this screen will update as soon as your plan changes.
              </p>
            </BlockCard>
          )}

          <SecondaryButton onClick={() => navigate({ to: "/profile" })}>
            Back to profile
          </SecondaryButton>
        </div>
      </div>

      <BottomTabBar active="Profile" />
    </div>
  );
}
