import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { BlockCard } from "@/components/untangle/BlockCard";
import { SecondaryButton } from "@/components/untangle/Buttons";
import { useAuth } from "@/auth/useAuth";
import { usePushReminders } from "@/hooks/usePushReminders";
import { useEntitlements } from "@/hooks/useEntitlements";
import { friendlyEntitlementError, usageLine } from "@/lib/entitlements";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Untangle" },
      { name: "description", content: "Your Untangle account and notification settings." },
      { property: "og:title", content: "Profile — Untangle" },
      { property: "og:description", content: "Your Untangle account and notification settings." },
    ],
  }),
  component: withAuth(Profile),
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
        {label}
      </span>
      <span className="text-[13px] font-medium text-ink">{value}</span>
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
        <Link
          to="/upgrade"
          className="mt-3 block text-[13px] font-semibold text-teal underline"
        >
          See Untangle Plus
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
    <>
      <BlockCard title="Your plan">
        {isPending ? (
          <p className="text-[13px] text-ink-soft">Checking your plan…</p>
        ) : error ? (
          <p className="text-[13px] text-ink-soft">{friendlyEntitlementError(error)}</p>
        ) : entitlements ? (
          <>
            <Row label="Plan" value={entitlements.planLabel} />
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

      {entitlements && !entitlements.isPlus ? (
        <UpgradePrompt message="Untangle Plus unlocks your Vault, deadline reminders and more analyses each month." />
      ) : null}
    </>
  );
}

function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/landing", replace: true });
  };

  return (
    <div className="min-h-screen bg-paper px-5 pt-8 pb-[110px]">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-[21px] font-semibold text-ink">Profile</h1>

        <div className="mt-5 space-y-3">
          <BlockCard title="Account">
            <Row label="Email" value={profile?.email ?? user?.email ?? "—"} />
            <Row label="Name" value={profile?.displayName ?? "Not set"} />
            <Row label="Account type" value={profile?.userType ?? "Individual"} />
          </BlockCard>

          <PlanSection />

          <PushSection />

          <SecondaryButton onClick={handleSignOut}>Log out</SecondaryButton>
        </div>
      </div>

      <BottomTabBar active="Profile" />
    </div>
  );
}
