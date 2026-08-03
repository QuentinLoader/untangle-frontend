import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StampBadge } from "@/components/untangle/StampBadge";
import { BlockCard } from "@/components/untangle/BlockCard";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "TaxSnap result — Untangle" },
      {
        name: "description",
        content: "Your SARS letter explained in plain English with the key dates and actions.",
      },
      { property: "og:title", content: "TaxSnap result — Untangle" },
      {
        property: "og:description",
        content: "Your SARS letter explained in plain English with the key dates and actions.",
      },
    ],
  }),
  component: Result,
});

function Result() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-10 bg-paper px-5 pt-7 pb-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            to="/upload"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label="Go back"
          >
            <span className="text-[19px]">←</span>
          </Link>
          <h1 className="font-display text-[17px] font-semibold text-ink">TaxSnap</h1>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto px-5 pb-5">
        <div className="flex justify-end pt-1">
          <StampBadge label="Urgent" color="red" className="rotate-[-5deg]" />
        </div>

        <h2 className="mt-2 font-display text-[20px] font-semibold leading-snug text-ink">
          SARS wants R4,200 paid by 14 Jul
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
          SARS says you owe R4,200 in unpaid tax from a previous assessment, plus interest. You have
          until 14 July 2026 to pay or respond.
        </p>

        <BlockCard title="What you need to do" className="mt-5">
          <div className="space-y-3">
            <ActionRow text="Pay R4,200 via SARS eFiling before 14 Jul" />
            <ActionRow text="If you disagree, lodge a dispute instead of paying" />
          </div>
        </BlockCard>

        <BlockCard title="Key date" className="mt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] font-semibold text-ink">Payment deadline</span>
            <span className="rounded-full bg-tint-red px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-stamp-red">
              14 JUL
            </span>
          </div>
        </BlockCard>

        <BlockCard title="Worth knowing" className="mt-3">
          <div className="space-y-3 text-[12.5px] leading-relaxed text-ink-soft">
            <p>Interest keeps growing the longer this stays unpaid.</p>
            <p>You have the right to dispute this amount before paying, via SARS eFiling.</p>
          </div>
        </BlockCard>

        <div className="mt-5 space-y-3">
          <PrimaryButton onClick={() => navigate({ to: "/reminder" })}>Set a reminder</PrimaryButton>
          <SecondaryButton>Find a tax practitioner near me</SecondaryButton>
        </div>

        <div className="sticky bottom-0 mt-6 border-t border-dashed border-line bg-paper pt-4 pb-2">
          <p className="text-[10px] leading-relaxed text-ink-soft">
            Untangle gives general information only and isn't a registered tax practitioner. For
            disputes, audits, or amounts over R10,000, consult a SARS-registered tax practitioner.
          </p>
        </div>
      </main>
    </div>
  );
}

function ActionRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-[15px] w-[15px] shrink-0 rounded-[3px] border-2 border-ink-soft" />
      <span className="text-[12.5px] leading-snug text-ink">{text}</span>
    </div>
  );
}
