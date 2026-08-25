import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
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
      { title: "Plan & billing — Untangle" },
      {
        name: "description",
        content: "View your Untangle plan and upgrade to Untangle Plus for R79 a month.",
      },
      { property: "og:title", content: "Plan & billing — Untangle" },
      {
        property: "og:description",
        content: "View your Untangle plan and upgrade to Untangle Plus for R79 a month.",
      },
    ],
  }),
  component: withAuth(PlanBillingPage),
});

const PLUS_BENEFITS = [
  "Unlimited document analyses",
  "Vault and longer document history",
  "In-app deadline reminders",
  "Browser reminders on supported devices",
  "Calendar export for deadlines",
];

function formatPeriodEnd(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function PlanBillingPage() {
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
  const periodEnd = formatPeriodEnd(entitlements?.currentPeriodEnd ?? null);

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-teal">
          Account
        </p>
        <h1 className="mt-2 font-display text-[24px] font-semibold text-ink">Plan & billing</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          See your current access and manage upgrades from one place.
        </p>

        <div className="mt-5 space-y-3">
          <BlockCard title="Current plan">
            {isPending ? (
              <p className="text-[13px] text-ink-soft">Checking your plan…</p>
            ) : error ? (
              <p className="text-[13px] text-ink-soft">{friendlyEntitlementError(error)}</p>
            ) : entitlements ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[18px] font-bold text-ink">{entitlements.planLabel}</p>
                    {entitlements.isPlus ? (
                      <p className="mt-1 text-[13px] text-ink-soft">R79 monthly access</p>
                    ) : (
                      <p className="mt-1 text-[13px] text-ink-soft">Up to 3 successful analyses per month</p>
                    )}
                  </div>
                  <span className="rounded-full bg-teal-dim px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-teal">
                    {entitlements.isPlus ? entitlements.subscriptionStatus ?? "Active" : "Free"}
                  </span>
                </div>
                {usageLine(entitlements) ? (
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{usageLine(entitlements)}</p>
                ) : null}
                {periodEnd ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    Current access period ends {periodEnd}.
                  </p>
                ) : null}
                {entitlements.retentionDays !== null ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    Document retention: {entitlements.retentionDays} days.
                  </p>
                ) : null}
              </>
            ) : null}
          </BlockCard>

          <BlockCard title="Untangle Plus">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[20px] font-bold text-ink">R79</p>
                <p className="text-[12.5px] text-ink-soft">per month</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-teal-dim text-teal">
                <CreditCard size={19} aria-hidden />
              </div>
            </div>
            <ul className="mt-4 space-y-2.5">
              {PLUS_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-[13px] text-ink">
                  <CheckCircle2 size={15} className="mt-[2px] shrink-0 text-teal" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </BlockCard>

          <div className="flex items-start gap-2 rounded-[14px] border border-line bg-white/60 px-4 py-3">
            <ShieldCheck size={16} className="mt-[1px] shrink-0 text-teal" aria-hidden />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              Payments are completed securely through Ozow. Untangle does not receive your banking credentials.
            </p>
          </div>

          {checkoutError ? <p className="text-[13px] text-stamp-red">{checkoutError}</p> : null}

          {isPlus ? (
            <PrimaryButton onClick={() => navigate({ to: "/" })}>Continue to Untangle</PrimaryButton>
          ) : (
            <PrimaryButton onClick={startCheckout} disabled={starting || isPending}>
              {starting ? "Opening secure payment…" : "Upgrade to Plus — R79/month"}
            </PrimaryButton>
          )}

          <SecondaryButton onClick={() => navigate({ to: "/profile" })}>Back to account</SecondaryButton>
        </div>
      </div>

      <BottomTabBar active="Account" />
    </div>
  );
}
