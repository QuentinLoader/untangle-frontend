import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import { AppShell } from "@/components/untangle/v2/AppShell";
import { useEntitlements } from "@/hooks/useEntitlements";
import { friendlyEntitlementError, usageLine } from "@/lib/entitlements";
import { createCheckout, friendlyBillingError, submitCheckoutForm } from "@/lib/billing";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Plan & billing — Untangle South Africa" },
      {
        name: "description",
        content: "View your Untangle plan and buy one month of Untangle Plus for R79.",
      },
      { property: "og:title", content: "Plan & billing — Untangle South Africa" },
      {
        property: "og:description",
        content: "View your Untangle plan and Untangle Plus access.",
      },
    ],
  }),
  component: withAuth(PlanBillingPage),
});

const PLUS_BENEFITS = [
  "Unlimited document analyses",
  "Document history and longer retention",
  "In-app deadline reminders",
  "Browser reminders on supported devices",
  "Calendar export for supported deadlines",
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
    <AppShell active="Account" planLabel={entitlements?.isPlus ? "Plus" : "Free"}>
      <div className="mx-auto w-full max-w-[820px]">
        <Link
          to="/profile"
          className="inline-flex min-h-11 items-center text-[12.5px] font-semibold text-teal"
        >
          ← Back to Account
        </Link>

        <header className="mt-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            Account
          </p>
          <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-ink">
            Plan &amp; billing
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-ink-soft">
            Your current access and the option to add one month of Untangle Plus.
          </p>
        </header>

        <section className="mt-7 border-y border-line bg-white px-5 py-5">
          {isPending ? (
            <p className="text-[13px] text-ink-soft">Checking your plan…</p>
          ) : error ? (
            <p className="text-[13px] text-ink-soft">{friendlyEntitlementError(error)}</p>
          ) : entitlements ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-medium text-ink-soft">Current plan</p>
                  <p className="mt-1 text-[22px] font-semibold text-ink">{entitlements.planLabel}</p>
                </div>
                <span className="rounded-full bg-teal-dim px-2.5 py-1 text-[10.5px] font-semibold text-teal">
                  {isPlus ? entitlements.subscriptionStatus ?? "Active" : "Free"}
                </span>
              </div>

              {!isPlus && usageLine(entitlements) ? (
                <p className="mt-4 text-[13px] leading-5 text-ink-soft">{usageLine(entitlements)}</p>
              ) : null}

              {isPlus ? (
                <div className="mt-4 border-t border-line pt-4 text-[12.5px] leading-5 text-ink-soft">
                  {periodEnd ? <p>Your current Plus access ends {periodEnd}.</p> : null}
                  <p className={periodEnd ? "mt-1" : ""}>
                    Plus does not renew automatically. You choose when to pay for another month.
                  </p>
                </div>
              ) : null}

              {entitlements.retentionDays !== null ? (
                <p className="mt-4 border-t border-line pt-4 text-[12.5px] leading-5 text-ink-soft">
                  Documents are kept for {entitlements.retentionDays} days on this plan.
                </p>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="mt-8">
          <div className="flex items-center gap-2">
            <CreditCard size={17} className="text-teal" aria-hidden />
            <h2 className="text-[19px] font-semibold text-ink">
              {isPlus ? "Add another month" : "Untangle Plus"}
            </h2>
          </div>

          <div className="mt-3 border-y border-line bg-white px-5 py-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[26px] font-semibold tracking-[-0.03em] text-ink">R79</p>
                <p className="mt-0.5 text-[12.5px] text-ink-soft">for one month</p>
              </div>
              <p className="text-right text-[12px] leading-5 text-ink-soft">
                No automatic renewal
              </p>
            </div>

            <ul className="mt-5 divide-y divide-line/80 border-y border-line/80">
              {PLUS_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex gap-2.5 py-3 text-[13px] text-ink">
                  <Check size={15} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={starting || isPending}
              className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-teal px-5 text-[14px] font-semibold text-white disabled:opacity-60 sm:w-auto"
            >
              {starting
                ? "Opening secure payment…"
                : isPlus
                  ? "Add another month — R79"
                  : "Get Plus for one month — R79"}
            </button>

            {checkoutError ? (
              <p className="mt-3 text-[12.5px] leading-5 text-stamp-red">{checkoutError}</p>
            ) : null}
          </div>
        </section>

        <div className="mt-5 flex items-start gap-2.5 px-1 text-[12px] leading-5 text-ink-soft">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <p>
            Payment is completed securely through Ozow. Untangle does not receive your banking credentials.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
