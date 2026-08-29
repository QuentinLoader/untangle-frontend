import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Solution } from "@/lib/solutions";

/** PRODUCT METADATA presentation — never makes a backend call. */
export function SolutionCard({
  solution,
  featured = false,
}: {
  solution: Solution;
  featured?: boolean;
}) {
  const available = solution.status === "AVAILABLE";

  if (featured) {
    return (
      <Link
        to="/solutions/$slug"
        params={{ slug: solution.slug }}
        className="block rounded-[20px] border border-teal/30 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(15,110,92,0.8)] transition-transform active:scale-[0.99]"
      >
        <div className="flex items-start gap-4">
          <div
            className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-[14px] text-[22px]"
            style={{ backgroundColor: solution.tint }}
            aria-hidden
          >
            {solution.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-[20px] font-semibold leading-tight text-ink">
                  {solution.name}
                </h3>
                <p className="mt-1 text-[12.5px] font-medium text-teal">{solution.tagline}</p>
              </div>
              <span className="shrink-0 rounded-full bg-teal px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                Available
              </span>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{solution.purpose}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-teal">
              Open {solution.name}
              <ArrowRight size={14} aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/solutions/$slug"
      params={{ slug: solution.slug }}
      className={`flex h-full flex-col rounded-[16px] border bg-white p-[14px] transition-all active:scale-[0.98] ${
        available ? "border-teal/40 hover:border-teal active:bg-teal-dim/30" : "border-line hover:bg-paper-2/50 active:bg-paper-2"
      }`}
    >
      <div
        className={`grid h-[34px] w-[34px] place-items-center rounded-[10px] text-[17px] ${
          available ? "" : "opacity-60"
        }`}
        style={{ backgroundColor: solution.tint }}
        aria-hidden
      >
        {solution.icon}
      </div>
      <h3
        className={`mt-3 text-[14px] font-bold leading-snug ${available ? "text-ink" : "text-ink-soft"}`}
      >
        {solution.name}
      </h3>
      <p className="mt-[2px] text-[12px] leading-relaxed text-ink-soft">{solution.tagline}</p>
      <span
        className={`mt-3 inline-flex w-fit items-center rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${
          available ? "bg-teal text-white" : "border border-line bg-paper-2 text-ink-soft"
        }`}
      >
        {available ? "Available" : "Coming soon"}
      </span>
    </Link>
  );
}
