import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reminder")({
  head: () => ({
    meta: [
      { title: "Set a reminder — Untangle" },
      {
        name: "description",
        content: "Set a reminder for your SARS payment deadline.",
      },
      { property: "og:title", content: "Set a reminder — Untangle" },
      {
        property: "og:description",
        content: "Set a reminder for your SARS payment deadline.",
      },
    ],
  }),
  component: Reminder,
});

function Reminder() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-7">
        <header className="flex items-center gap-3">
          <Link
            to="/result"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label="Go back"
          >
            <span className="text-[19px]">←</span>
          </Link>
          <h1 className="font-display text-[17px] font-semibold text-ink">Set a reminder</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <p className="text-center text-[15px] text-ink-soft">Reminder placeholder</p>
        </div>
      </div>
    </div>
  );
}
