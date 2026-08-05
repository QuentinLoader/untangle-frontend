import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "New document — Untangle" },
      {
        name: "description",
        content: "Snap or upload a SARS letter, lease, agreement or job offer to have it explained.",
      },
      { property: "og:title", content: "New document — Untangle" },
      {
        property: "og:description",
        content: "Snap or upload your document and get it in plain English.",
      },
    ],
  }),
  component: withAuth(Upload),
});

function Upload() {
  const navigate = useNavigate();

  const startProcessing = () => {
    navigate({ to: "/processing" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        <header className="flex items-center gap-3 pt-7">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label="Go back"
          >
            <span className="text-[19px]">←</span>
          </Link>
          <h1 className="font-display text-[17px] font-semibold text-ink">New document</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <button
            onClick={startProcessing}
            className="grid h-[210px] w-[210px] place-items-center rounded-[24px] border-[3px] border-dashed border-teal bg-teal-dim text-5xl transition-transform active:scale-[0.98]"
            aria-label="Snap or upload your document"
          >
            📷
          </button>

          <h2 className="mt-8 text-center font-display text-[20px] font-semibold leading-snug text-ink">
            Snap or upload your document
          </h2>
          <p className="mt-3 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-soft">
            Works for SARS letters, leases, purchase agreements or job offers — you don't need to tell
            us which.
          </p>

          <div className="mt-8 w-full max-w-[280px] space-y-3">
            <PrimaryButton onClick={startProcessing}>Take a photo</PrimaryButton>
            <SecondaryButton onClick={startProcessing}>Choose from files</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
