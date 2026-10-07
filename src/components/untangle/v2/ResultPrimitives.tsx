import type { ReactNode } from "react";

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "attention" | "critical" | "confirmed";
}) {
  const tones = {
    neutral: "border-line bg-white text-ink-soft",
    attention: "border-amber-200 bg-amber-50 text-amber-900",
    critical: "border-red-200 bg-red-50 text-stamp-red",
    confirmed: "border-emerald-200 bg-emerald-50 text-teal",
  } as const;

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-[12px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function KeyMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string | undefined;
}) {
  return (
    <div className="min-w-0 border-t border-line/80 py-4 first:border-t-0 lg:border-t-0 lg:border-l lg:px-5 lg:first:border-l-0">
      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-ink-soft">{label}</p>
      <p className="mt-1 break-words text-[22px] font-semibold tracking-[-0.02em] text-ink lg:text-[24px]">
        {value}
      </p>
      {note ? <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{note}</p> : null}
    </div>
  );
}

export function ResultSection({
  id,
  title,
  intro,
  children,
  disclosure = false,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
  disclosure?: boolean;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-line/80 pt-8 first:border-t-0 first:pt-0"
    >
      <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink md:text-[22px]">
        {title}
      </h2>
      {intro ? (
        <p className="mt-2 max-w-3xl text-[14.5px] leading-7 text-ink-soft">{intro}</p>
      ) : null}
      {disclosure ? (
        <details className="mt-4">
          <summary
            aria-label={"Show " + title.toLowerCase()}
            className="flex min-h-11 cursor-pointer items-center text-[14px] font-semibold text-teal"
          >
            Show details
          </summary>
          <div className="mt-3">{children}</div>
        </details>
      ) : (
        <div className="mt-5">{children}</div>
      )}
    </section>
  );
}

export function FactRows({
  rows,
}: {
  rows: Array<{ label: string; value: string; note?: string | undefined }>;
}) {
  return (
    <dl className="divide-y divide-line/80 border-y border-line/80">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-6"
        >
          <dt className="text-[13.5px] font-medium text-ink-soft">{row.label}</dt>
          <dd className="text-[14.5px] font-semibold leading-6 text-ink sm:text-right">
            {row.value}
            {row.note ? (
              <span className="mt-1 block text-[12.5px] font-normal leading-5 text-ink-soft">
                {row.note}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MeaningBlock({
  title,
  children,
  tone = "plain",
}: {
  title: string;
  children: ReactNode;
  tone?: "plain" | "attention";
}) {
  return (
    <div
      className={
        tone === "attention"
          ? "border-l-4 border-stamp-amber bg-amber-50/70 px-4 py-4"
          : "border-l-2 border-line px-4 py-1"
      }
    >
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <div className="mt-2 text-[14.5px] leading-7 text-ink-soft">{children}</div>
    </div>
  );
}

export function BulletList({ items }: { items: Array<{ title: string; detail: string }> }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.title} className="grid grid-cols-[18px_minmax(0,1fr)] gap-3">
          <span className="mt-[9px] h-2 w-2 rounded-full bg-teal" aria-hidden />
          <span>
            <span className="block text-[14.5px] font-semibold text-ink">{item.title}</span>
            <span className="mt-1 block text-[14px] leading-6 text-ink-soft">{item.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function EvidenceDisclosure({
  source,
  location,
  excerpt,
  meaning,
  sourceLabel = "What the agreement says",
  meaningLabel = "What this means",
}: {
  source: string;
  location: string;
  excerpt: string;
  meaning: string;
  sourceLabel?: string;
  meaningLabel?: string;
}) {
  return (
    <details className="group border-t border-line/80 py-4 first:border-t-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <span>
          <span className="block text-[13.5px] font-semibold text-ink">{source}</span>
          <span className="mt-0.5 block font-mono text-[11px] text-ink-soft">{location}</span>
        </span>
        <span className="text-[12px] font-semibold text-teal group-open:hidden">Show source</span>
        <span className="hidden text-[12px] font-semibold text-teal group-open:inline">
          Hide source
        </span>
      </summary>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="border-l-2 border-line pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            {sourceLabel}
          </p>
          <p className="mt-2 text-[13.5px] leading-6 text-ink">“{excerpt}”</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            {meaningLabel}
          </p>
          <p className="mt-2 text-[13.5px] leading-6 text-ink-soft">{meaning}</p>
        </div>
      </div>
    </details>
  );
}

export function AskPrompt({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-[13.5px] font-medium text-ink transition-colors hover:bg-paper-2"
    >
      {children}
    </button>
  );
}
