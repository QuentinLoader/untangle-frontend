import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { Solution } from "@/lib/solutions";

/**
 * One full-width product row. Every Untangle product uses the same row so no
 * product is visually more important than another.
 */
export function ProductRow({ solution }: { solution: Solution }) {
  const Icon = solution.icon;
  const comingSoon = solution.status !== "AVAILABLE";

  return (
    <Link
      to="/solutions/$slug"
      params={{ slug: solution.slug }}
      className="flex min-h-[76px] w-full items-center gap-4 rounded-2xl border border-line/70 bg-white px-4 py-4 transition-colors active:bg-paper-2"
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-teal"
        style={{ backgroundColor: solution.tint }}
        aria-hidden
      >
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[16px] font-semibold text-ink">{solution.name}</span>
          {comingSoon ? (
            <span className="shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-soft">
              Coming soon
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-ink-soft">
          {solution.shortDescription}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-soft" aria-hidden />
    </Link>
  );
}
