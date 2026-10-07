import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CreditCard, LogOut, Pencil, ShieldCheck } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import { AppShell } from "@/components/untangle/v2/AppShell";
import { useAuth } from "@/auth/useAuth";
import { usePushReminders } from "@/hooks/usePushReminders";
import { useEntitlements } from "@/hooks/useEntitlements";
import { friendlyEntitlementError, usageLine } from "@/lib/entitlements";
import { resolveDisplayName } from "@/lib/display-name";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Account — Untangle South Africa" },
      {
        name: "description",
        content: "Your Untangle South Africa profile, plan and security settings.",
      },
      { property: "og:title", content: "Account — Untangle South Africa" },
      {
        property: "og:description",
        content: "Your Untangle South Africa profile, plan and security settings.",
      },
    ],
  }),
  component: withAuth(Account),
});

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-line/80 py-3.5 first:border-t-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5">
      <span className="text-[12.5px] font-medium text-ink-soft">{label}</span>
      <span className="break-words text-[13.5px] font-semibold text-ink sm:text-right">{value}</span>
    </div>
  );
}

function NameRow({ value, onSave }: { value: string; onSave: (name: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const name = draft.trim();
    if (!name || saving) {
      setError(name ? null : "Enter your name.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(name);
      setEditing(false);
    } catch {
      setError("Could not save your name. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="grid gap-1 border-t border-line/80 py-3.5 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:gap-5">
        <span className="text-[12.5px] font-medium text-ink-soft">Name</span>
        <span className="flex min-w-0 items-center gap-2 sm:justify-end">
          <span className="truncate text-[13.5px] font-semibold text-ink">{value || "Not set"}</span>
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setError(null);
              setEditing(true);
            }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-teal transition-colors hover:bg-teal-dim"
            aria-label="Edit your name"
          >
            <Pencil size={15} aria-hidden />
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="border-t border-line/80 py-3.5">
      <label htmlFor="display-name" className="text-[12.5px] font-medium text-ink-soft">
        Name
      </label>
      <input
        id="display-name"
        type="text"
        autoComplete="name"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="e.g. Quentin Loader"
        className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none focus:border-teal"
      />
      {error ? <p className="mt-1.5 text-[12px] text-stamp-red">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 text-[12.5px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-4 text-[12.5px] font-semibold text-ink disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PlanSection() {
  const { entitlements, isPending, error } = useEntitlements();

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Plan</p>
          <h2 className="mt-1 text-[19px] font-semibold text-ink">Your access</h2>
        </div>
        <Link
          to="/upgrade"
          className="inline-flex min-h-11 items-center gap-1.5 py-3 text-[12.5px] font-semibold text-teal"
        >
          <CreditCard size={14} aria-hidden />
          Plan &amp; billing
        </Link>
      </div>

      <div className="mt-3 border-y border-line bg-white px-4 py-4">
        {isPending ? (
          <p className="text-[13px] text-ink-soft">Checking your plan…</p>
        ) : error ? (
          <p className="text-[13px] text-ink-soft">{friendlyEntitlementError(error)}</p>
        ) : entitlements ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[18px] font-semibold text-ink">{entitlements.planLabel}</p>
                {usageLine(entitlements) ? (
                  <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{usageLine(entitlements)}</p>
                ) : null}
              </div>
              <span className="rounded-full bg-teal-dim px-2.5 py-1 text-[10.5px] font-semibold text-teal">
                {entitlements.isPlus ? entitlements.subscriptionStatus ?? "Active" : "Free"}
              </span>
            </div>

            {entitlements.retentionDays !== null ? (
              <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-5 text-ink-soft">
                Documents are kept for {entitlements.retentionDays} days on this plan.
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}

function PushSection() {
  const { state, busy, error, enable, disable } = usePushReminders();

  const copy: Record<string, string> = {
    loading: "Checking this browser…",
    unsupported: "This browser cannot show reminders.",
    "not-configured": "Browser reminders are not available yet.",
    "requires-plus": "Browser reminders are available with Untangle Plus.",
    blocked: "Notifications are blocked in this browser.",
    off: "Browser reminders are off on this device.",
    on: "Browser reminders are on for this device.",
  };

  return (
    <section>
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-teal" aria-hidden />
        <h2 className="text-[16px] font-semibold text-ink">Browser reminders</h2>
      </div>

      <div className="mt-3 border-y border-line bg-white px-4 py-4">
        <p className="text-[12.5px] leading-5 text-ink-soft">{copy[state]}</p>
        {error ? <p className="mt-2 text-[12px] text-stamp-red">{error}</p> : null}

        {state === "requires-plus" ? (
          <Link to="/upgrade" className="mt-3 inline-flex min-h-11 items-center text-[12.5px] font-semibold text-teal">
            View Untangle Plus
          </Link>
        ) : null}

        {state === "off" || state === "on" ? (
          <button
            type="button"
            onClick={state === "on" ? disable : enable}
            disabled={busy}
            className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-4 text-[12.5px] font-semibold text-ink disabled:opacity-60"
          >
            {busy ? "Working…" : state === "on" ? "Turn off" : "Turn on"}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function Account() {
  const { user, profile, signOut, updateDisplayName } = useAuth();
  const navigate = useNavigate();
  const { entitlements } = useEntitlements();
  const displayName = resolveDisplayName(profile, user) ?? "";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/landing", replace: true });
  };

  return (
    <AppShell active="Account" planLabel={entitlements?.isPlus ? "Plus" : "Free"}>
      <div className="mx-auto w-full max-w-[920px]">
        <header>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink">Account</h1>
          <p className="mt-2 text-[14px] leading-6 text-ink-soft">
            Your profile, plan and security.
          </p>
        </header>

        <div className="mt-7 grid gap-9 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <section>
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                Profile
              </p>
              <div className="mt-3 border-y border-line bg-white px-4">
                <DetailRow label="Email" value={profile?.email ?? user?.email ?? "—"} />
                <NameRow value={displayName} onSave={updateDisplayName} />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal" aria-hidden />
                <h2 className="text-[16px] font-semibold text-ink">Security</h2>
              </div>
              <div className="mt-3 border-y border-line bg-white px-4 py-4">
                <p className="text-[12.5px] leading-5 text-ink-soft">
                  This browser can keep you signed in until you sign out or your session expires.
                  Protected documents and results still require a valid Untangle session.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/forgot-password"
                    className="inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-4 text-[12.5px] font-semibold text-ink"
                  >
                    Reset password
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-[12.5px] font-semibold text-stamp-red"
                  >
                    <LogOut size={15} aria-hidden />
                    Sign out
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <PlanSection />
            <PushSection />

            <section>
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                Support
              </p>
              <div className="mt-3 border-y border-line bg-white px-4 py-4">
                <p className="text-[12.5px] leading-5 text-ink-soft">
                  Need help with your account or a document?
                </p>
                <a
                  href="mailto:support@addvision.co.za"
                  className="mt-2 inline-flex min-h-11 items-center text-[12.5px] font-semibold text-teal"
                >
                  support@addvision.co.za
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
