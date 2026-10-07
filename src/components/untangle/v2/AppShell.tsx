import type { ReactNode } from "react";
import { Bell, FolderClosed, House, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/untangle/BrandMark";
import { PortfolioFooter } from "./PortfolioFooter";

type AppSection = "Home" | "Documents" | "Reminders" | "Account";

const NAV = [
  { to: "/home", label: "Home", icon: House },
  { to: "/vault", label: "Documents", icon: FolderClosed },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/profile", label: "Account", icon: UserRound },
] as const;

export function AppShell({
  active,
  planLabel,
  children,
}: {
  active: AppSection;
  planLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper pb-[calc(64px+env(safe-area-inset-bottom))] text-ink lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/home" className="flex min-h-11 min-w-0 items-center gap-2.5">
            <BrandMark size={26} />
            <span className="min-w-0">
              <span className="block truncate text-[17px] font-semibold leading-tight text-ink">
                Untangle
              </span>
              <span className="block truncate text-[11.5px] leading-tight text-ink-soft">
                South Africa
              </span>
            </span>
          </Link>

          <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => {
              const selected = active === item.label;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                    selected
                      ? "bg-white text-ink"
                      : "text-ink-soft hover:bg-white/70 hover:text-ink"
                  }`}
                  aria-current={selected ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/upgrade"
            className="ml-auto inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-[12.5px] font-semibold text-ink-soft transition-colors hover:bg-paper-2"
          >
            {planLabel}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
        {children}
      </main>
      <PortfolioFooter />

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex h-[64px] max-w-md items-stretch px-2">
          {NAV.map((item) => {
            const selected = active === item.label;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium"
                style={{ color: selected ? "var(--teal)" : "var(--ink-soft)" }}
                aria-current={selected ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={selected ? 2.2 : 1.7} aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
