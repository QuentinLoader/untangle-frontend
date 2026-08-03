import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Reading your document — Untangle" },
      {
        name: "description",
        content: "Untangle is reading your document and extracting what matters.",
      },
      { property: "og:title", content: "Reading your document — Untangle" },
      {
        property: "og:description",
        content: "Untangle is reading your document and extracting what matters.",
      },
    ],
  }),
  component: Processing,
});

function Processing() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-7">
        <header className="flex items-center gap-3">
          <Link
            to="/upload"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label="Go back"
          >
            <span className="text-[19px]">←</span>
          </Link>
          <h1 className="font-display text-[17px] font-semibold text-ink">New document</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <p className="text-center text-[15px] text-ink-soft">Processing placeholder</p>
        </div>
      </div>
    </div>
  );
}
