import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  component: Upload,
});

function Upload() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-md px-5 pt-7">
        <button
          onClick={() => navigate({ to: "/" })}
          className="font-display text-[19px] font-semibold text-ink"
        >
          ← New document
        </button>

        <div className="mt-10 grid aspect-square place-items-center rounded-[22px] border-[2.5px] border-dashed border-teal bg-teal-dim text-4xl">
          📷
        </div>

        <h1 className="mt-8 text-center font-display text-[26px] font-semibold leading-snug">
          Snap or upload your document
        </h1>
        <p className="mt-3 text-center text-[14.5px] leading-relaxed text-ink-soft">
          Works for SARS letters, leases, purchase agreements or job offers — you don't need to tell
          us which.
        </p>

        <div className="mt-7 space-y-3 pb-12">
          <PrimaryButton>Take a photo</PrimaryButton>
          <SecondaryButton>Choose from files</SecondaryButton>
        </div>
      </div>
    </div>
  );
}
