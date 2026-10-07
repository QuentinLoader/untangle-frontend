import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import type { Solution } from "@/lib/solutions";

export function PolicyCheckEntry({ solution }: { solution: Solution }) {
  return (
    <div className="min-h-screen bg-paper pb-[104px] text-ink">
      <main className="mx-auto w-full max-w-[980px] px-5 pb-12 pt-6 sm:px-7 lg:px-8 lg:pt-8">
        <Link
          to="/home"
          className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
        >
          <ArrowLeft size={18} aria-hidden />
          Home
        </Link>

        <div className="max-w-[760px]">
          <div className="mt-5 flex items-start gap-3 border-l-[3px] border-blue-500 pl-4">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-blue-700"
              style={{ backgroundColor: solution.tint }}
              aria-hidden
            >
              <ShieldCheck size={20} strokeWidth={1.9} />
            </span>
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">PolicyCheck</h1>
              <p className="mt-0.5 text-[12px] font-medium text-ink-soft">
                Part of Untangle South Africa
              </p>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                Insurance policies and claim decisions
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="max-w-3xl text-[30px] font-semibold leading-[1.15] tracking-[-0.035em] text-ink sm:text-[38px]">
              Know what you’re actually covered for.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-soft">
              PolicyCheck brings related policy documents together, separates cover you actually
              bought from benefits that are only described, and explains important limits,
              exclusions and claim decisions in plain language.
            </p>

            <div className="mt-6 border-l-2 border-blue-400 bg-blue-50/70 px-4 py-3">
              <p className="text-[13.5px] font-semibold text-ink">PolicyCheck is in final validation</p>
              <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                The customer experience is being completed behind the release gate. Uploads stay
                closed until genuine-document testing passes.
              </p>
            </div>
          </section>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 border border-line bg-white px-4 py-3">
              <p className="text-[13.5px] font-semibold text-ink">Understand my policy</p>
              <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                See purchased cover, premiums, excesses, waiting periods, exclusions and important conditions.
              </p>
            </div>
            <div className="flex-1 border border-line bg-white px-4 py-3">
              <p className="text-[13.5px] font-semibold text-ink">Understand a claim decision</p>
              <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                See the insurer’s stated reason, the clause relied on and approved review guidance where supported.
              </p>
            </div>
          </div>

          <div className="mt-7 divide-y divide-line/80 border-y border-line/80">
            <Point
              icon={<CheckCircle2 size={17} />}
              title="Cover actually purchased"
              detail="PolicyCheck keeps confirmed purchased cover separate from benefits that appear only in generic policy wording."
            />
            <Point
              icon={<FileCheck2 size={17} />}
              title="Limits, exclusions and conditions"
              detail="Important limits and requirements are kept with the source evidence that supports them."
            />
            <Point
              icon={<AlertTriangle size={17} />}
              title="Gaps stay visible"
              detail="Missing documents, conflicting information and unconfirmed cover are shown instead of guessed."
            />
          </div>

          <div className="mt-7 flex items-start gap-2.5 text-[12px] leading-5 text-ink-soft">
            <FileText size={15} className="mt-0.5 shrink-0 text-blue-600" aria-hidden />
            <p>
              PolicyCheck may need more than one policy document to reconstruct the current position safely.
            </p>
          </div>
        </div>
      </main>

      <BottomTabBar active="Home" />
    </div>
  );
}

function Point({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-[26px_minmax(0,1fr)] gap-3 py-4">
      <span className="mt-0.5 text-blue-600" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-ink-soft">{detail}</p>
      </div>
    </div>
  );
}
