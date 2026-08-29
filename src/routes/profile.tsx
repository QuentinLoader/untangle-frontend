import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, LogOut } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { BlockCard } from "@/components/untangle/BlockCard";
import { SecondaryButton } from "@/components/untangle/Buttons";
import { useAuth } from "@/auth/useAuth";
import { usePushReminders } from "@/hooks/usePushReminders";
import { useEntitlements } from "@/hooks/useEntitlements";
import { friendlyEntitlementError, usageLine } from "@/lib/entitlements";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Account — Untangle" },
      { name: "description", content: "Your Untangle account, plan, billing and notification settings." },
      { property: "og:title", content: "Account — Untangle" },
      {
        property: "og:description",
        content: "Your Untangle account, plan, billing and notification settings.",
      },
    ],
  }),
  component: withAuth(Account),
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
        {label}
      </span>
      <span className="text-right text-[13px] font-medium text-ink">{value}</span>
    </div>
  );
}

function PushSection() {
  const { state, busy, error, enable, disable } = usePushReminders();

  const copy: Record<string, string> = {
    loading: "Checking browser reminders…",
    unsupported: "This browser can't show reminders.",
    "not-configured": "Browser reminders aren't available yet.",
    "requires-plus": "Browser reminders are part of Untangle Plus.",
    blocked: "Notifications are blocked in your browser settings.",
    off: "Get a reminder in this browser before a deadline.",
    on: "Browser reminders are on for this device.",
  };

  return (
    <BlockCard title="Browser reminders">
      <p className="text-[13px] text-ink-soft">{copy[state]}</p>
      {error ? <p className="mt-2 text-[12.5px] text-stamp-red">{error}</p> : null}
      {state === "requires-plus" ? (
        <Link to="/upgrade" className="mt-3 block text-[13px] font-semibold text-teal">
          View plan & billing →
        </Link>
      ) : null}
      {state === "off" || state === "on" ? (
        <div className="mt-3">
          <SecondaryButton onClick={state === "on" ? disable : enable} disabled={busy}>
            {busy ? "Working…" : state === "on" ? "Turn off" : "Turn on reminders"}
          </SecondaryButton>
        </div>
      ) : null}
    </BlockCard>
  );
}

function PlanSection() {
  const { entitlements, isPending, error } = useEntitlements();

  return (
    <BlockCard
      title="Plan & billing"
      action={
        <Link to="/upgrade" className="inline-flex items-center gap-1 text-[12px] font-bold text-teal">
          <CreditCard size={13} aria-hidden />
          View
        </Link>
      }
    >
      {isPending ? (
        <p className="text-[13px] text-ink-soft">Checking your plan…</p>
      ) : error ? (
        <p className="text-[13px] text-ink-soft">{friendlyEntitlementError(error)}</p>
      ) : entitlements ? (
        <>
          <Row label="Plan" value={entitlements.planLabel} />
          {entitlements.subscriptionStatus && entitlements.isPlus ? (
            <Row label="Status" value={entitlements.subscriptionStatus.replaceAll("_", " ")} />
          ) : null}
          {usageLine(entitlements) ? (
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{usageLine(entitlements)}</p>
          ) : null}
          {entitlements.retentionDays !== null ? (
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Documents are kept for {entitlements.retentionDays} days on this plan.
            </p>
          ) : null}
          <Link
            to="/upgrade"
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-teal"
          >
            {entitlements.isPlus ? "Open billing details" : "Upgrade to Untangle Plus"} →
          </Link>
        </>
      ) : null}
    </BlockCard>
  );
}

function Account() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/landing", replace: true });
  };

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-[24px] font-semibold text-ink">Account</h1>
        <p className="mt-1 text-[13px] text-ink-soft">Your details, plan, billing and reminder settings.</p>

        <div className="mt-5 space-y-3">
          <BlockCard title="Account details">
            <Row label="Email" value={profile?.email ?? user?.email ?? "—"} />
            {profile?.displayName?.trim() ? <Row label="Name" value={profile.displayName} /> : null}
          </BlockCard>

          <PlanSection />
          <PushSection />

          <SecondaryButton onClick={handleSignOut}>
            <span className="inline-flex items-center justify-center gap-2">
              <LogOut size={16} aria-hidden />
              Log out
            </span>
          </SecondaryButton>
        </div>
      </div>

      <BottomTabBar active="Account" />
    </div>
  );
}
