import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { BlockCard } from "@/components/untangle/BlockCard";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { useEntitlements } from "@/hooks/useEntitlements";
import { friendlyEntitlementError, usageLine } from "@/lib/entitlements";
import { createCheckout, friendlyBillingError, submitCheckoutForm } from "@/lib/billing";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Untangle Plus — Untangle" },
      {
        name: "description",
        content: "Untangle Plus unlocks your Vault, deadline reminders and unlimited analyses.",
      },
      { property: "og:title", content: "Untangle Plus — Untangle" },
      {
        property: "og:description",
        content: "Unlimited analyses, your Vault and deadline reminders for R79 a month.",
      },
    ],
  }),
  component: withAuth(UpgradePage),
});

const PLUS_BENEFITS = [
  "📄 Unlimited document analyses.",
  "🗂️ Your Vault — every document you've untangled, kept together.",
  "🕰️ Longer document history and retention.",
  "⏰ In-app deadline reminders before a due date arrives.",
  "🔔 Browser reminders on the devices you use.",
  "📅 Calendar export for your deadlines.",
];

function UpgradePage() {
  const navigate = useNavigate();
  const { entitlements, isPending, error } = useEntitlements();
  const [starting, setStarting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const startCheckout = async () => {
    if (starting) return;
    setStarting(true);
    setCheckoutError(null);
    try {
      const { checkout } = await createCheckout("PLUS_MONTHLY");
      submitCheckoutForm(checkout);
    } catch (err) {
      setCheckoutError(friendlyBillingError(err));
      setStarting(false);
    }
  };

  const isPlus = entitlements?.isPlus === true;

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
              {PLUS_BENEFITS.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </BlockCard>

          {isPlus ? (
            <>
              <BlockCard title="Already on Plus">
                <p className="text-[13px] text-ink-soft">
                  Untangle Plus is active — everything above is already switched on.
                </p>
              </BlockCard>
              <PrimaryButton onClick={() => navigate({ to: "/" })}>
                Continue to Untangle
              </PrimaryButton>
            </>
          ) : (
            <>
              <BlockCard title="Untangle Plus">
                <p className="text-[17px] font-bold text-ink">R79 / month</p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  You'll pay securely through Ozow. Untangle never sees your banking details.
                </p>
              </BlockCard>

              {checkoutError ? (
                <p className="text-[13px] text-stamp-red">{checkoutError}</p>
              ) : null}

              <PrimaryButton onClick={startCheckout} disabled={starting}>
                {starting ? "Opening secure payment…" : "Continue to secure payment"}
              </PrimaryButton>
            </>
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
