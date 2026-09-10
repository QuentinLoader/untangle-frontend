import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Clock } from "lucide-react";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { ProductRow } from "@/components/untangle/ProductRow";
import { useAuth } from "@/auth/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { SOLUTION_LIST } from "@/lib/solutions";
import { listReminders, reminderDocumentTitle, reminderView } from "@/lib/reminders";
import { firstName, resolveDisplayName } from "@/lib/display-name";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Untangle — Understand what to do next" },
      {
        name: "description",
        content:
          "Untangle explains South African tax letters, residential leases, insurance policies and employment documents in plain English.",
      },
      { property: "og:title", content: "Untangle — Understand what to do next" },
      {
        property: "og:description",
        content: "Understand the paperwork. Know what to do next.",
      },
    ],
  }),
  component: withAuth(Index),
});

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Index() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { entitlements, error: entitlementsError } = useEntitlements();

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => listReminders(),
    retry: false,
    enabled: entitlements ? entitlements.remindersEnabled : false,
  });

  // At most one item on Home; the full list lives on Reminders.
  const attention = (remindersQuery.data?.data.reminders ?? [])
    .map(reminderView)
    .filter((view) => view.state === "DUE" || view.state === "UPCOMING")
    .sort((a, b) => {
      if (a.state !== b.state) return a.state === "DUE" ? -1 : 1;
      return new Date(a.effectiveDate ?? 0).getTime() - new Date(b.effectiveDate ?? 0).getTime();
    })[0];

  const name = firstName(resolveDisplayName(profile, user));

  return (
    <div className="min-h-screen bg-paper pb-[104px]">
      <div className="mx-auto max-w-md px-5 pt-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden />
              <span className="font-display text-[19px] font-semibold text-ink">Untangle</span>
            </div>
            <p className="mt-1 truncate text-[14px] text-ink-soft">
              {greeting(new Date())}
              {name ? `, ${name}` : ""}
            </p>
          </div>
          <Link
            to="/upgrade"
            className="inline-flex h-11 shrink-0 items-center rounded-full border border-line bg-white px-4 text-[12.5px] font-medium text-ink-soft transition-colors active:bg-paper-2"
          >
            {entitlements?.isPlus ? "Plus" : "Free"}
          </Link>
        </header>

        <section className="mt-9">
          <h1 className="font-display text-[26px] font-semibold leading-snug text-ink">
            What would you like to understand today?
          </h1>

          <div className="mt-5 space-y-3">
            {SOLUTION_LIST.map((solution) => (
              <ProductRow key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>

        {attention ? (
          <section className="mt-9">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[13px] font-semibold text-ink-soft">Needs your attention</h2>
              <Link
                to="/reminders"
                className="inline-flex min-h-[44px] items-center rounded-lg px-2 text-[13px] font-semibold text-teal active:bg-teal-dim"
              >
                Reminders
              </Link>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/reminders" })}
              className={`mt-2 flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
                attention.state === "DUE"
                  ? "border-teal/50 bg-teal-dim/50"
                  : "border-line/70 bg-white active:bg-paper-2"
              }`}
            >
              <Clock size={18} className="shrink-0 text-teal" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-ink">
                  {attention.reminder.label}
                </span>
                <span className="block truncate text-[12.5px] text-ink-soft">
                  {reminderDocumentTitle(attention.reminder)} · {attention.statusLabel}
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
            </button>
          </section>
        ) : null}
      </div>

      <BottomTabBar active="Home" />
    </div>
  );
}
