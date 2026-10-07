import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/untangle/BrandMark";

export function PublicSiteShell({
  children,
  signedIn = false,
}: {
  children: ReactNode;
  signedIn?: boolean;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex min-h-[68px] max-w-[1180px] items-center gap-4 px-5 sm:px-7 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <BrandMark size={27} />
            <span className="min-w-0">
              <span className="block truncate text-[16.5px] font-semibold leading-tight text-ink">
                Untangle
              </span>
              <span className="block truncate text-[11.5px] leading-tight text-ink-soft">
                South Africa
              </span>
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1">
            {signedIn ? (
              <Link
                to="/home"
                className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 text-[13.5px] font-semibold text-white"
              >
                Open Untangle
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  search={{ redirect: undefined }}
                  className="inline-flex min-h-11 items-center rounded-xl px-3 text-[13.5px] font-semibold text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  search={{ redirect: "/home" }}
                  className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 text-[13.5px] font-semibold text-white"
                >
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-7 text-[12.5px] text-ink-soft sm:px-7 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>Untangle South Africa is an AddVision product.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/terms" className="font-medium hover:text-ink">
              Terms &amp; privacy
            </Link>
            <a href="mailto:support@addvision.co.za" className="font-medium hover:text-ink">
              Support
            </a>
            <a href="https://addvision.co.za" className="font-medium hover:text-ink">
              AddVision
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
