import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";

export const Route = createFileRoute("/reminder")({
  head: () => ({
    meta: [
      { title: "Reminder set — Untangle" },
      {
        name: "description",
        content: "Your reminder is set. We'll nudge you before your deadline.",
      },
      { property: "og:title", content: "Reminder set — Untangle" },
      {
        property: "og:description",
        content: "Your reminder is set. We'll nudge you before your deadline.",
      },
    ],
  }),
  component: withAuth(Reminder),
});

function Reminder() {
  const navigate = useNavigate({ from: "/reminder" });

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-7">
        <header className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/vault" })}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label="Go back"
          >
            <span className="text-[19px]">←</span>
          </button>
          <h1 className="font-display text-[17px] font-semibold text-ink">TaxSnap</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal">
            <span className="text-[30px] text-white">✓</span>
          </div>

          <h2 className="mt-6 font-display text-[20px] font-semibold text-ink">
            Reminder set
          </h2>

          <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-ink-soft">
            We'll nudge you before your 14 July deadline so it doesn't sneak up on you.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-teal-dim px-3 py-1.5 font-mono text-[11px] font-bold text-teal">
              14 days before
            </span>
            <span className="rounded-full bg-teal-dim px-3 py-1.5 font-mono text-[11px] font-bold text-teal">
              7 days
            </span>
            <span className="rounded-full bg-teal-dim px-3 py-1.5 font-mono text-[11px] font-bold text-teal">
              1 day
            </span>
          </div>

          <div className="mt-10 w-full max-w-[280px] space-y-3">
            <SecondaryButton>Add to phone calendar too</SecondaryButton>
            <PrimaryButton onClick={() => navigate({ to: "/vault" })}>
              Go to my Vault
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
