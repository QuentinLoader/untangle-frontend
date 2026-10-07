import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ChevronRight } from "lucide-react";
import { PageState } from "@/components/untangle/v2/PageState";
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

function dateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusText(view: ReminderView): string {
  if (view.state === "DUE") return "Due now";
  if (view.state === "UPCOMING") return "Upcoming";
  return view.statusLabel;
}

export function ReminderTimeline({ from = "reminders" }: { from?: ResultOrigin }) {
  const navigate = useNavigate();
  const {
    entitlements,
    isPending: accessPending,
    error: accessError,
    refetch: retryAccess,
  } = useEntitlements();
  const remindersLocked = entitlements ? !entitlements.remindersEnabled : false;
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data, isPending, error, refetch } = useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: () => listReminders(),
    retry: false,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled: entitlements?.remindersEnabled === true,
  });

  const views = useMemo(() => (data?.data.reminders ?? []).map(reminderView), [data]);
  const now = new Date();
  const upcoming = views.filter((view) => view.state === "DUE" || view.state === "UPCOMING");
  const past = views.filter((view) => view.state !== "DUE" && view.state !== "UPCOMING");
  const rows = tab === "upcoming" ? upcoming : past;

  if (accessPending)
    return (
      <PageState title="Checking your account…" body="Confirming access to reminders." loading />
    );
  if (accessError)
    return (
      <PageState
        title="Account features could not be loaded"
        body="Try again to view reminders."
        onRetry={() => void retryAccess()}
      />
    );
  if (remindersLocked) {
    return (
      <div className="max-w-2xl">
        <UpgradePrompt
          title="Reminders are part of Plus"
          message="Untangle Plus keeps important dates from your documents together and lets you set reminders."
        />
      </div>
    );
  }

  if (isPending) {
    return <PageState title="Loading your reminders…" body="Checking important dates." loading />;
  }

  if (error) {
    return (
      <PageState
        title="Reminders could not be loaded"
        body={friendlyReminderError(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  if (views.length === 0) {
    return (
      <div className="border-y border-line bg-white px-5 py-7">
        <div className="flex items-start gap-3">
          <CalendarClock size={20} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <div>
            <p className="text-[15px] font-semibold text-ink">No reminders yet</p>
            <p className="mt-1 text-[13px] leading-5 text-ink-soft">
              When a result includes an important date, you can add a reminder from that document.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const grouped = GROUPS.map((group) => ({
    group,
    items: rows
      .filter((view) => view.effectiveDate && groupFor(new Date(view.effectiveDate), now) === group)
      .sort(
        (a, b) =>
          new Date(a.effectiveDate ?? 0).getTime() - new Date(b.effectiveDate ?? 0).getTime(),
      ),
  })).filter(({ items }) => items.length > 0);

  const undated = rows.filter((view) => !view.effectiveDate);

  return (
    <div>
      <div className="flex gap-2 border-b border-line">
        {(["upcoming", "past"] as const).map((value) => {
          const selected = tab === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`min-h-[44px] border-b-2 px-1 text-[13px] font-semibold transition-colors ${
                selected
                  ? "border-teal text-ink"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {value === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-[13.5px] text-ink-soft">
          {tab === "upcoming" ? "No upcoming reminders." : "No past reminders yet."}
        </p>
      ) : (
        <div className="mt-5 space-y-7">
          {grouped.map(({ group, items }) => (
            <section key={group}>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                {group}
              </h2>

              <div className="mt-2 border-y border-line bg-white">
                {items.map((view) => (
                  <button
                    key={view.reminder.reminderId}
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/result",
                        search: { documentId: view.reminder.documentId, from },
                      })
                    }
                    className="grid min-h-[72px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-line/80 px-4 py-3.5 text-left first:border-t-0 hover:bg-paper-2/60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {view.reminder.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-ink-soft">
                        {reminderDocumentTitle(view.reminder)}
                      </span>
                      <span className="mt-1 block text-[12px] text-ink-soft">
                        {view.effectiveDate ? dateLabel(view.effectiveDate) : "Date unavailable"} ·{" "}
                        {statusText(view)}
                      </span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
                  </button>
                ))}
              </div>
            </section>
          ))}

          {undated.length > 0 ? (
            <section>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                No date
              </h2>
              <div className="mt-2 border-y border-line bg-white">
                {undated.map((view) => (
                  <button
                    key={view.reminder.reminderId}
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/result",
                        search: { documentId: view.reminder.documentId, from },
                      })
                    }
                    className="grid min-h-[68px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-line/80 px-4 py-3 text-left first:border-t-0 hover:bg-paper-2/60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {view.reminder.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-ink-soft">
                        {reminderDocumentTitle(view.reminder)} · {statusText(view)}
                      </span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
