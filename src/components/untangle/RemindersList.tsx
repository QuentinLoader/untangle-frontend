import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import {
  formatReminderDate,
  friendlyReminderError,
  getLatestSentOccurrence,
  getNextScheduledOccurrence,
  listReminders,
  reminderDocumentTitle,
} from "@/lib/reminders";
import type { ResultOrigin } from "@/lib/navigation";

export const REMINDERS_QUERY_KEY = ["reminders"] as const;

/**
 * The single reminder-list implementation. Used by the /reminders screen so
 * reminder data logic is never duplicated.
 */
export function RemindersList({ from = "reminders" }: { from?: ResultOrigin }) {
  const navigate = useNavigate();
  const { entitlements } = useEntitlements();
  const remindersLocked = entitlements ? !entitlements.remindersEnabled : false;

  const { data, isPending, error } = useQuery({
    queryKey: REMINDERS_QUERY_KEY,
    queryFn: () => listReminders(),
    retry: false,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled: !remindersLocked,
  });

  if (remindersLocked)
    return (
      <div className="mt-6">
        <UpgradePrompt
          title="Reminders are part of Plus"
          message="Untangle Plus reminds you before a deadline from your documents arrives."
        />
      </div>
    );

  const reminders = data?.data.reminders ?? [];

  if (isPending) return <p className="mt-8 text-[14px] text-ink-soft">Loading your reminders…</p>;
  if (error)
    return <p className="mt-8 text-[14px] text-ink-soft">{friendlyReminderError(error)}</p>;
  if (reminders.length === 0)
    return <p className="mt-8 text-[14px] text-ink-soft">No reminders yet.</p>;

  const rows = reminders.map((reminder) => ({
    reminder,
    sent: getLatestSentOccurrence(reminder),
    next: getNextScheduledOccurrence(reminder),
  }));

  // Due in-app reminders first, then upcoming ones.
  rows.sort((a, b) => {
    if (!!a.sent !== !!b.sent) return a.sent ? -1 : 1;
    if (a.sent && b.sent) {
      return (
        new Date(b.sent.sentAt ?? b.sent.scheduledFor).getTime() -
        new Date(a.sent.sentAt ?? a.sent.scheduledFor).getTime()
      );
    }
    if (a.next && b.next) {
      return new Date(a.next.scheduledFor).getTime() - new Date(b.next.scheduledFor).getTime();
    }
    return a.next ? -1 : b.next ? 1 : 0;
  });

  return (
    <div className="mt-6 space-y-3">
      {rows.map(({ reminder, sent, next }) => {
        const isDue = Boolean(sent);
        const statusLine = sent
          ? `Due now — ${formatReminderDate(sent.sentAt ?? sent.scheduledFor)}`
          : next
            ? `Upcoming — ${formatReminderDate(next.scheduledFor)}`
            : reminder.status === "CANCELLED"
              ? "Reminder cancelled"
              : reminder.occurrences && reminder.occurrences.length > 0
                ? "No upcoming reminders"
                : "Reminder could not be processed";

        return (
          <button
            key={reminder.reminderId}
            type="button"
            onClick={() =>
              navigate({ to: "/result", search: { documentId: reminder.documentId, from } })
            }
            className={`flex w-full items-center justify-between gap-3 rounded-[14px] border bg-white p-[14px] text-left ${
              isDue ? "border-teal" : "border-line"
            }`}
          >
            <div>
              <p className="text-[14px] font-bold text-ink">{reminder.label}</p>
              <p className="mt-0.5 text-[12px] text-ink-soft">{reminderDocumentTitle(reminder)}</p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-soft">
                {statusLine}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase ${
                isDue ? "bg-teal text-white" : "bg-teal-dim text-teal"
              }`}
            >
              {isDue ? "Due" : "Upcoming"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
