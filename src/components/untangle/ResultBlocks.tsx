import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";

/**
 * Shared presentation blocks for every product result (TaxSnap, LeaseCheck,
 * PolicyCheck, WorkCheck). Nothing here knows about a specific product:
 * the pattern is Overview -> actionable information -> important details ->
 * optional deeper evidence.
 */

/** Compact tappable row that jumps to another result section. */
export function ResultNavRow({
  label,
  onClick,
  hint,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-line/70 bg-white px-4 text-left transition-colors active:bg-paper-2"
    >
      <span className="min-w-0">
        <span className="block text-[14.5px] font-semibold text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-[12px] text-ink-soft">{hint}</span> : null}
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
    </button>
  );
}

/** Primary forward action for a result section. */
export function ResultPrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-teal px-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.99]"
    >
      {label}
      <ChevronRight size={17} aria-hidden />
    </button>
  );
}

/**
 * Ask is not operational yet. It stays visible for product consistency but is
 * never presented as a working production action.
 */
export function AskComingSoonButton() {
  return (
    <div
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-white/60 px-4 text-[14.5px] font-medium text-ink-soft"
      aria-disabled="true"
    >
      <MessageSquare size={16} aria-hidden />
      Ask a question
      <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
        Coming soon
      </span>
    </div>
  );
}

/** Progressive disclosure row: collapsed title, expanded supporting detail. */
export function Disclosure({
  title,
  children,
  tone = "plain",
}: {
  title: string;
  children: ReactNode;
  tone?: "plain" | "card";
}) {
  return (
    <details
      className={`group ${
        tone === "card"
          ? "rounded-2xl border border-line/70 bg-white p-4"
          : "rounded-xl bg-paper-2/60 px-3"
      }`}
    >
      <summary
        className={`flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-[13.5px] font-semibold text-ink ${
          tone === "card" ? "text-[14px]" : ""
        }`}
      >
        {title}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className={tone === "card" ? "mt-3" : "pb-3 pt-1"}>{children}</div>
    </details>
  );
}

/** Single, quiet disclaimer treatment — never repeated within one section. */
export function ResultFooterDisclaimer({ wording }: { wording: string }) {
  return <p className="px-1 pb-1 pt-3 text-[10.5px] leading-relaxed text-ink-soft">{wording}</p>;
}
