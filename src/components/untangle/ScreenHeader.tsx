import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Standard screen title block with optional back control and trailing slot. */
export function ScreenHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Back",
  trailing,
}: {
  title: string;
  subtitle?: string;
  backTo?: "/" | "/vault" | "/reminders" | "/profile";
  backLabel?: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="pt-2">
      {backTo ? (
        <Link
          to={backTo}
          aria-label={backLabel}
          className="-ml-2 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors active:bg-paper-2"
        >
          <ArrowLeft size={20} aria-hidden />
        </Link>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-semibold leading-tight text-ink">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{subtitle}</p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
