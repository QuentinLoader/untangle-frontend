import { useState } from "react";
import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { BlockCard } from "@/components/untangle/BlockCard";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getDocumentResult, formatResultDate } from "@/lib/documents";
import {
  createReminder,
  formatReminderDate,
  friendlyReminderError,
  isFutureDateString,
  type Reminder,
} from "@/lib/reminders";

type ReminderSearch = { documentId: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/reminder")({
  validateSearch: (search: Record<string, unknown>): ReminderSearch => {
    const value = typeof search['documentId'] === "string" ? search['documentId'] : "";
    return { documentId: UUID_RE.test(value) ? value : "" };
  },
  head: () => ({
    meta: [
      { title: "Set a reminder — Untangle" },
      {
        name: "description",
        content: "Set a reminder so a deadline from your document does not sneak up on you.",
      },
      { property: "og:title", content: "Set a reminder — Untangle" },
      {
        property: "og:description",
        content: "Set a reminder so a deadline from your document does not sneak up on you.",
      },
    ],
  }),
  component: withAuth(ReminderPage),
});

function ReminderPage() {
  const { documentId } = Route.useSearch();
  const navigate = useNavigate({ from: "/reminder" });
  const queryClient = useQueryClient();

  const { entitlements } = useEntitlements();
  const remindersLocked = entitlements ? !entitlements.remindersEnabled : false;

  const [created, setCreated] = useState<Reminder | null>(null);
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Deadlines are always re-read from the Result API — never trusted from the URL.
  const { data, isPending, error } = useQuery({
    queryKey: ["document-result", documentId],
    queryFn: () => getDocumentResult(documentId),
    enabled: documentId !== "" && !remindersLocked,
    retry: false,
  });

  const result = data?.data.result;
  const candidates = result?.reminderCandidates ?? [];

  const mutation = useMutation({
    mutationFn: createReminder,
    onSuccess: (response) => {
      setCreated(response.data.reminder);
      void queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (err) => setFormError(friendlyReminderError(err)),
  });

  const submit = (nextLabel: string, nextDate: string, key: string | null) => {
    setFormError(null);
    const trimmed = nextLabel.trim();
    if (trimmed.length === 0) {
      setFormError("Give this reminder a short name.");
      return;
    }
    if (!isFutureDateString(nextDate)) {
      setFormError("Choose a valid date that has not already passed.");
      return;
    }
    mutation.mutate({ documentId, label: trimmed, dueDate: nextDate, deadlineKey: key });
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-7 pb-8">
        <header className="flex items-center gap-3">
          <button
            onClick={() =>
              documentId
                ? navigate({ to: "/result", search: { documentId, from: "vault" as const } })
                : navigate({ to: "/vault" })
            }
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label="Go back"
          >
            <span className="text-[19px]">←</span>
          </button>
          <h1 className="font-display text-[17px] font-semibold text-ink">
            {created ? "Reminder set" : "Set a reminder"}
          </h1>
        </header>

        {remindersLocked ? (
          <div className="mt-6">
            <UpgradePrompt
              title="Reminders are part of Plus"
              message="Untangle Plus reminds you before a deadline from your documents arrives."
            />
          </div>
        ) : created ? (
          <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal">
              <span className="text-[30px] text-white">✓</span>
            </div>
            <h2 className="mt-6 font-display text-[20px] font-semibold text-ink">Reminder set</h2>
            <p className="mt-2 max-w-[270px] text-[13px] leading-relaxed text-ink-soft">
              We'll nudge you before {formatReminderDate(created.dueDate)} so it doesn't sneak up
              on you.
            </p>
            <span className="mt-4 rounded-full bg-teal-dim px-3 py-1.5 font-mono text-[11px] font-bold text-teal">
              {created.label}
            </span>

            <div className="mt-10 w-full max-w-[280px] space-y-3">
              <SecondaryButton
                onClick={() =>
                  documentId
                    ? navigate({ to: "/result", search: { documentId, from: "vault" as const } })
                    : navigate({ to: "/vault" })
                }
              >
                Back to the document
              </SecondaryButton>
              <PrimaryButton onClick={() => navigate({ to: "/vault" })}>
                Go to my Vault
              </PrimaryButton>
            </div>
          </div>
        ) : documentId === "" ? (
          <Message
            title="We could not find this document"
            body="Open the document from your vault and set the reminder from its result."
          />
        ) : isPending ? (
          <Message title="Loading…" body="One moment while we check this document." />
        ) : error || !result ? (
          <Message
            title="This document could not be loaded"
            body="Please open it again from your vault and try once more."
          />
        ) : (
          <div className="mt-6 space-y-3">
            {candidates.length > 0 && (
              <BlockCard title="Deadlines from this document">
                <div className="space-y-3">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-[13.5px] font-semibold text-ink">{candidate.label}</p>
                        <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink-soft">
                          {formatResultDate(candidate.dueDate)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={mutation.isPending}
                        onClick={() =>
                          submit(
                            candidate.label,
                            candidate.dueDate.slice(0, 10),
                            candidate.deadlineKey,
                          )
                        }
                        className="rounded-full bg-teal px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        Remind me
                      </button>
                    </div>
                  ))}
                </div>
              </BlockCard>
            )}

            <BlockCard
              title={candidates.length > 0 ? "Or add your own date" : "Add a date yourself"}
            >
              {candidates.length === 0 && (
                <p className="mb-3 text-[12.5px] leading-relaxed text-ink-soft">
                  No deadline was found in the validated facts from this document. You can still
                  set a reminder using a date of your own.
                </p>
              )}
              <label className="block text-[12px] font-semibold text-ink" htmlFor="reminder-label">
                What is this reminder for?
              </label>
              <input
                id="reminder-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Submit supporting documents"
                className="mt-1.5 w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none focus:border-teal"
              />

              <label
                className="mt-3 block text-[12px] font-semibold text-ink"
                htmlFor="reminder-date"
              >
                Date
              </label>
              <input
                id="reminder-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-[10px] border border-line bg-white px-3 py-2.5 font-mono text-[13px] text-ink outline-none focus:border-teal"
              />

              <div className="mt-4">
                <PrimaryButton
                  disabled={mutation.isPending}
                  onClick={() => submit(label, dueDate, null)}
                >
                  {mutation.isPending ? "Saving…" : "Set reminder"}
                </PrimaryButton>
              </div>
            </BlockCard>

            {formError && (
              <p className="px-1 text-[12.5px] leading-relaxed text-stamp-red">{formError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
      <h2 className="font-display text-[19px] font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
