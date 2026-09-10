import type { ResultSection } from "@/lib/solutions";

/**
 * Shared results navigation. Product-specific section labels come from the
 * solution catalogue, so a new product supplies its own sections without a new
 * results framework. Sections marked `available: false` stay visible for
 * product consistency but are never presented as working functions.
 */
export function ResultSectionNav({
  sections,
  active,
  onSelect,
}: {
  sections: ResultSection[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Result sections"
      className="flex gap-1 overflow-x-auto rounded-full bg-paper-2 p-1"
    >
      {sections.map((section) => {
        const isActive = section.id === active;
        const unavailable = section.available === false;
        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={unavailable || undefined}
            disabled={unavailable}
            title={unavailable ? "Coming soon" : undefined}
            onClick={() => {
              if (!unavailable) onSelect(section.id);
            }}
            className={`relative min-h-[44px] flex-1 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold transition-colors ${
              unavailable
                ? "cursor-not-allowed text-ink-soft/50"
                : isActive
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-soft active:bg-white/60"
            }`}
          >
            {section.label}
            {unavailable ? (
              <span className="ml-1 align-super text-[8.5px] font-semibold uppercase tracking-wide">
                soon
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Placeholder panel for follow-up questions until that backend exists. */
export function AskSectionPlaceholder({ productName }: { productName: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/70 p-5 text-center">
      <p className="text-[15px] font-semibold text-ink">Follow-up questions</p>
      <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-ink-soft">
        Asking {productName} a question about this document is not available yet. When it is, it
        will live here — grounded in this document only.
      </p>
    </div>
  );
}
