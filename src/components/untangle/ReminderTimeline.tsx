import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  friendlyReminderError,
  listReminders,
  reminderDocumentTitle,
  reminderView,
  type ReminderView,
} from "@/lib/reminders";
import type { ResultOrigin } from "@/lib/navigation";

export const REMINDERS_QUERY_KEY = ["reminders"] as const;

const GROUPS = ["Today", "This week", "Next 30 days", "Later"] as const;
type GroupName = (typeof GROUPS)[number];

function groupFor(date: Date, now: Date): GroupName {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const days = Math.floor((date.getTime() - startOfToday.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days <= 7) return "This week";
  if (days <= 30) return "Next 30 days";
  return "Later";
}

function dayLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short" })
    .format(date)
    .toUpperCase();
}

function yearLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

const STATUS_STYLE: Record<ReminderView["state"], string> = {
  DUE: "bg-teal text-white",
  UPCOMING: "bg-teal-dim text-teal",
  PAST: "bg-paper-2 text-ink-soft",
  CANCELLED: "bg-paper-2 text-ink-soft",
  INACTIVE: "bg-paper-2 text-ink-soft",
};

/**
 * Reminders as a deadline timeline. Single source of truth: the ["reminders"]
 * query. Each reminder resolves to exactly one state so contradictory labels
 * (e.g. "Upcoming" next to "Reminder cancelled") can never render.
 */
export function ReminderTimeline({ from = "reminders" }: { from?: ResultOrigin }) {
  const navigate = useNavigate();
  const { entitlements } = useEntitlements();
  const remindersLocked = entitlements ? !entitlements.remindersEnabled : false;
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data, isPending, error } = useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: () => listReminders(),
    retry: false,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled: !remindersLocked,
  });

  const views = useMemo(
    () => (data?.data.reminders ?? []).map(reminderView),
    [data],
  );

  const now = new Date();
  const active = views.filter((v) => v.state === "DUE" || v.state === "UPCOMING");
  const past = views.filter((v) => v.state !== "DUE" && v.state !== "UPCOMING");

  if (remindersLocked)
    return (
      <div className="mt-6">
        <UpgradePrompt
          title="Reminders are part of Plus"
          message="Untangle Plus reminds you before a deadline from your documents arrives."
        />
      </div>
    );

  if (isPending) return <p className="mt-8 text-[14px] text-ink-soft">Loading your reminders…</p>;
  if (error)
    return <p className="mt-8 text-[14px] text-ink-soft">{friendlyReminderError(error)}</p>;

  if (views.length === 0)
    return (
      <div className="mt-8 rounded-[16px] border border-dashed border-line bg-white/60 p-5">
        <p className="text-[15px] font-bold text-ink">No reminders yet</p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          When Untangle finds an important date, or when you add a reminder yourself, it will
          appear here.
        </p>
      </div>
    );

  const rows = tab === "upcoming" ? active : past;

  const grouped = GROUPS.map((group) => ({
    group,
    items: rows
      .filter((v) => v.effectiveDate && groupFor(new Date(v.effectiveDate), now) === group)
      .sort(
        (a, b) => new Date(a.effectiveDate!).getTime() - new Date(b.effectiveDate!).getTime(),
      ),
  })).filter((g) => tab === "upcoming" || g.items.length > 0);

  const undated = rows.filter((v) => !v.effectiveDate);

  return (
    <div className="mt-5">
      <div className="flex gap-2">
        {(["upcoming", "past"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-[7px] font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] ${
              tab === value ? "bg-ink text-paper" : "border border-line bg-white text-ink-soft"
            }`}
          >
            {value === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-soft">
          {tab === "upcoming" ? "No upcoming reminders." : "Nothing in your reminder history yet."}
        </p>
      ) : null}

      <div className="mt-6 space-y-7">
        {grouped.map(({ group, items }) => (
          <section key={group}>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                {group}
              </h2>
              <span className="h-px flex-1 bg-line" />
            </div>

            {items.length === 0 ? (
              <p className="mt-3 text-[13px] text-ink-soft">No reminders {group.toLowerCase()}</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {items.map((view) => (
                  <li key={view.reminder.reminderId} className="flex gap-3">
                    <div className="w-[54px] shrink-0 pt-[2px] text-right">
                      <p className="font-mono text-[12px] font-bold leading-none text-ink">
                        {dayLabel(view.effectiveDate!)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] leading-none text-ink-soft">
                        {yearLabel(view.effectiveDate!)}
                      </p>
                    </div>
                    <div
                      className={`flex-1 border-l-2 pl-4 ${
                        view.state === "DUE" ? "border-teal" : "border-line"
                      }`}
                    >
                      <p className="text-[15px] font-bold leading-snug text-ink">
                        {view.reminder.label}
                      </p>
                      <p className="mt-[2px] text-[12px] text-ink-soft">
                        {reminderDocumentTitle(view.reminder)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] ${STATUS_STYLE[view.state]}`}
                        >
                          {view.statusLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            navigate({
                              to: "/result",
                              search: { documentId: view.reminder.documentId, from },
                            })
                          }
                          className="text-[12.5px] font-semibold text-teal"
                        >
                          View document →
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {undated.length > 0 ? (
          <section>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                No date
              </h2>
              <span className="h-px flex-1 bg-line" />
            </div>
            <ul className="mt-3 space-y-3">
              {undated.map((view) => (
                <li key={view.reminder.reminderId} className="border-l-2 border-line pl-4">
                  <p className="text-[15px] font-bold text-ink">{view.reminder.label}</p>
                  <p className="mt-[2px] text-[12px] text-ink-soft">
                    {reminderDocumentTitle(view.reminder)}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] ${STATUS_STYLE[view.state]}`}
                  >
                    {view.statusLabel}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
