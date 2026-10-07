import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CircleDollarSign,
  FileText,
  Home,
  Receipt,
  Users,
} from "lucide-react";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import type { Solution } from "@/lib/solutions";

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper pb-[104px] text-ink">
      <main className="mx-auto w-full max-w-[980px] px-5 pb-12 pt-6 sm:px-7 lg:px-8 lg:pt-8">
        {children}
      </main>
      <BottomTabBar active="Home" />
    </div>
  );
}

function BackToHome() {
  return (
    <Link
      to="/home"
      aria-label="Back to Home"
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
    >
      <ArrowLeft size={18} aria-hidden />
      Home
    </Link>
  );
}

function ProductIdentity({
  solution,
  accent,
  subtitle,
}: {
  solution: Solution;
  accent: string;
  subtitle: string;
}) {
  const Icon = solution.icon;
  return (
    <div className="mt-5 flex items-start gap-3 border-l-[3px] pl-4" style={{ borderLeftColor: accent }}>
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: solution.tint, color: accent }}
        aria-hidden
      >
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{solution.name}</h1>
        <p className="mt-0.5 text-[12px] font-medium text-ink-soft">Part of Untangle South Africa</p>
        <p className="mt-1 text-[12.5px] text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}

function PrimaryAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90 sm:w-auto"
    >
      {children}
      <ArrowRight size={17} aria-hidden />
    </button>
  );
}

function SimplePoints({
  items,
}: {
  items: Array<{ icon: ReactNode; title: string; detail: string }>;
}) {
  return (
    <div className="mt-7 divide-y divide-line/80 border-y border-line/80">
      {items.map((item) => (
        <div key={item.title} className="grid grid-cols-[26px_minmax(0,1fr)] gap-3 py-4">
          <span className="mt-0.5 text-teal" aria-hidden>{item.icon}</span>
          <div>
            <p className="text-[14px] font-semibold text-ink">{item.title}</p>
            <p className="mt-1 text-[13px] leading-5 text-ink-soft">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaxSnapEntry({ solution }: { solution: Solution }) {
  const navigate = useNavigate();
  const start = () =>
    navigate({
      to: "/upload",
      search: { solution: solution.slug },
    });

  return (
    <PageFrame>
      <BackToHome />
      <div className="max-w-[760px]">
        <ProductIdentity
          solution={solution}
          accent="var(--stamp-red)"
          subtitle="SARS letters, notices and assessments"
        />

        <section className="mt-8">
          <h2 className="max-w-3xl text-[30px] font-semibold leading-[1.15] tracking-[-0.035em] text-ink sm:text-[38px]">
            Understand what SARS wants from you.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-soft">
            Upload the letter or notice. We’ll explain what it is, what you need to do, important
            dates and what happens next.
          </p>

          <div className="mt-6">
            <PrimaryAction onClick={start}>Check my SARS document</PrimaryAction>
          </div>

          <p className="mt-3 max-w-xl text-[12.5px] leading-5 text-ink-soft">
            You don’t need to know what type of SARS document it is.
          </p>
        </section>

        <SimplePoints
          items={[
            {
              icon: <Check size={17} />,
              title: "What SARS wants",
              detail: "The required action is separated from the rest of the notice.",
            },
            {
              icon: <CalendarClock size={17} />,
              title: "Dates and money that matter",
              detail: "Important deadlines and amounts are brought forward when confirmed.",
            },
            {
              icon: <AlertTriangle size={17} />,
              title: "What happens next",
              detail: "You’ll see the practical consequence if the document says action is required.",
            },
          ]}
        />
      </div>
    </PageFrame>
  );
}

export function LeaseCheckEntry({ solution }: { solution: Solution }) {
  const navigate = useNavigate();
  const available = solution.status === "AVAILABLE" && solution.operational;
  const start = () =>
    navigate({
      to: "/upload",
      search: { solution: solution.slug },
    });

  return (
    <PageFrame>
      <BackToHome />
      <div className="max-w-[760px]">
        <ProductIdentity
          solution={solution}
          accent="var(--teal)"
          subtitle="Property, vehicle and equipment agreements"
        />

        <section className="mt-8">
          <h2 className="max-w-3xl text-[30px] font-semibold leading-[1.15] tracking-[-0.035em] text-ink sm:text-[38px]">
            Understand the agreement before you sign — or know where you stand if something has changed.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-soft">
            We’ll explain the money, responsibilities, important clauses and what happens if things go wrong.
          </p>

          {available ? (
            <div className="mt-6">
              <PrimaryAction onClick={start}>Check my agreement</PrimaryAction>
            </div>
          ) : (
            <div className="mt-6 border-l-2 border-stamp-amber bg-amber-50/70 px-4 py-3">
              <p className="text-[13.5px] font-semibold text-ink">LeaseCheck is not enabled yet</p>
              <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                The specialist experience remains behind its release gate.
              </p>
            </div>
          )}
        </section>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 border border-line bg-white px-4 py-3">
            <p className="text-[13.5px] font-semibold text-ink">Before I sign</p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
              Check cost, obligations and clauses before committing.
            </p>
          </div>
          <div className="flex-1 border border-line bg-white px-4 py-3">
            <p className="text-[13.5px] font-semibold text-ink">I already have an agreement</p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
              Understand a change, default, cancellation or other later document.
            </p>
          </div>
        </div>

        <SimplePoints
          items={[
            {
              icon: <CircleDollarSign size={17} />,
              title: "Money and total commitment",
              detail: "Payments, fees and end-of-term amounts are surfaced when the result confirms them.",
            },
            {
              icon: <Users size={17} />,
              title: "Who is responsible for what",
              detail: "Your duties are separated from the other party’s responsibilities.",
            },
            {
              icon: <FileText size={17} />,
              title: "Clauses and consequences",
              detail: "Important terms, ending/default consequences and applicable protections are explained clearly.",
            },
          ]}
        />
      </div>
    </PageFrame>
  );
}

export function GenericSolutionEntry({ solution }: { solution: Solution }) {
  const Icon = solution.icon;

  return (
    <PageFrame>
      <BackToHome />
      <div className="max-w-[720px]">
        <div className="mt-5 flex items-start gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-teal"
            style={{ backgroundColor: solution.tint }}
            aria-hidden
          >
            <Icon size={20} strokeWidth={1.9} />
          </span>
          <div>
            <h1 className="text-[22px] font-semibold text-ink">{solution.name}</h1>
            <p className="mt-0.5 text-[12px] text-ink-soft">Part of Untangle South Africa</p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink">
            {solution.description}
          </h2>
          <div className="mt-6 border-l-2 border-line bg-white px-4 py-3">
            <p className="text-[14px] font-semibold text-ink">Coming soon</p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
              {solution.name} is part of Untangle South Africa but is not available for customer analysis yet.
            </p>
          </div>
        </section>

        <ul className="mt-7 space-y-3">
          {solution.helps.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-3 text-[13.5px] leading-6 text-ink">
              <Check size={17} className="mt-1 shrink-0 text-teal" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </PageFrame>
  );
}
