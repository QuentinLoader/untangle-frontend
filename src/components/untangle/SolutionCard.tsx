import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Solution } from "@/lib/solutions";

/** Product metadata presentation only — never makes a backend call. */
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
            <h4 className="mt-3 text-[15px] font-bold leading-snug text-ink">{solution.headline}</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{solution.shortDescription}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {solution.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-paper-2 px-2 py-1 text-[10.5px] font-medium text-ink-soft"
                >
                  {tag}
                </span>
              ))}
            </div>
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
      className={`flex h-full flex-col rounded-[16px] border bg-white p-[14px] transition-colors ${
        available ? "border-teal/40 hover:border-teal" : "border-line hover:bg-paper-2/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`grid h-[34px] w-[34px] place-items-center rounded-[10px] text-[17px] ${available ? "" : "opacity-70"}`}
          style={{ backgroundColor: solution.tint }}
          aria-hidden
        >
          {solution.icon}
        </div>
        <span
          className={`rounded-full px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.06em] ${
            available ? "bg-teal text-white" : "border border-line bg-paper-2 text-ink-soft"
          }`}
        >
          {available ? "Available" : "Soon"}
        </span>
      </div>
      <h3 className="mt-3 text-[14px] font-bold leading-snug text-ink">{solution.name}</h3>
      <p className="mt-1 text-[11.5px] font-semibold leading-snug text-teal">{solution.headline}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {solution.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-paper-2 px-2 py-1 text-[9.5px] leading-none text-ink-soft"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
