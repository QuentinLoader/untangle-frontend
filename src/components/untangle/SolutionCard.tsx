import { Link } from "@tanstack/react-router";
import type { Solution } from "@/lib/solutions";

/** PRODUCT METADATA presentation — never makes a backend call. */
export function SolutionCard({ solution }: { solution: Solution }) {
  const available = solution.status === "AVAILABLE";
  return (
    <Link
      to="/solutions/$slug"
      params={{ slug: solution.slug }}
      className={`flex h-full flex-col rounded-[16px] border bg-white p-[14px] transition-colors ${
        available ? "border-teal/40 hover:border-teal" : "border-line hover:bg-paper-2/50"
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
      <p className="mt-[2px] text-[12px] text-ink-soft">{solution.tagline}</p>
      <span
        className={`mt-3 inline-flex w-fit items-center rounded-full px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] ${
          available ? "bg-teal text-white" : "border border-line bg-paper-2 text-ink-soft"
        }`}
      >
        {available ? "Available" : "Coming soon"}
      </span>
    </Link>
  );
}
