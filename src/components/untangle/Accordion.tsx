import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Shared compact accordion row. Used wherever supporting detail should stay
 * out of the way until a customer asks for it (landing questions, results,
 * product information).
 */
export function AccordionItem({
  label,
  title,
  children,
}: {
  /** Optional small product/category label above the question. */
  label?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-line last:border-b-0">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 py-3 text-left">
        <span className="min-w-0">
          {label ? (
            <span className="block font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-teal">
              {label}
            </span>
          ) : null}
          <span className="mt-0.5 block text-[15px] font-semibold leading-snug text-ink">
            {title}
          </span>
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="pb-4 pr-8 text-[14px] leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}
