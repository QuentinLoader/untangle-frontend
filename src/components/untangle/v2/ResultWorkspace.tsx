import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PortfolioFooter } from "./PortfolioFooter";
import { StatusBadge } from "./ResultPrimitives";

export type WorkspaceNavItem = {
  id: string;
  label: string;
};

export function ResultWorkspace({
  productName,
  portfolioLabel,
  documentLabel,
  navItems,
  children,
  context,
  backTo = "/home",
  backLabel = "Back to Home",
  statusLabel = "Result ready",
  trustNote = "Untangle South Africa is an AddVision product.",
}: {
  productName: string;
  portfolioLabel: string;
  documentLabel: string;
  navItems: WorkspaceNavItem[];
  children: ReactNode;
  context: ReactNode;
  backTo?: string;
  backLabel?: string;
  statusLabel?: string;
  trustNote?: string;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-[1320px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to={backTo}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-paper-2"
            aria-label={backLabel}
          >
            <ArrowLeft size={20} aria-hidden />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h1 className="text-[18px] font-semibold text-ink">{productName}</h1>
              <span className="text-[12.5px] text-ink-soft">{portfolioLabel}</span>
            </div>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">{documentLabel}</p>
          </div>

          <StatusBadge tone="confirmed">{statusLabel}</StatusBadge>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,720px)_280px]">
          <aside className="hidden lg:block">
            <nav className="sticky top-[96px]" aria-label="Result sections">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                In this report
              </p>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={"#" + item.id}
                      className="flex min-h-11 items-center rounded-lg px-3 py-2 text-[13.5px] font-medium text-ink-soft transition-colors hover:bg-white hover:text-ink"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="min-w-0">
            {trustNote !== "Untangle South Africa is an AddVision product." ? (
              <p className="mb-4 text-[12px] leading-5 text-ink-soft xl:hidden">{trustNote}</p>
            ) : null}
            <div
              className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden"
              aria-label="Result sections"
            >
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={"#" + item.id}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-white px-3 py-2 text-[12.5px] font-semibold text-ink-soft"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="rounded-[16px] border border-line/80 bg-white px-5 py-6 shadow-[0_1px_2px_rgba(20,34,27,0.03)] sm:px-7 sm:py-8 lg:px-8">
              {children}
            </div>
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-[96px] space-y-4">
              {context}
              <div className="flex items-start gap-2 border-t border-line pt-4 text-[12px] leading-5 text-ink-soft">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <p>{trustNote}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <PortfolioFooter />
    </div>
  );
}
