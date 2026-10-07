import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Home,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import type { Solution } from "@/lib/solutions";

function ProductHeader({
  name,
  subtitle,
  icon,
  tint,
}: {
  name: string;
  subtitle: string;
  icon: ReactNode;
  tint: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] text-teal"
        style={{ backgroundColor: tint }}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[24px]">{name}</h1>
        <p className="mt-0.5 text-[12.5px] font-medium text-ink-soft">Part of Untangle South Africa</p>
        <p className="mt-1 text-[13px] leading-5 text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}

function BackToHome() {
  return (
    <Link
      to="/home"
      aria-label="Back to Home"
      className="-ml-2 mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-white active:bg-paper-2"
    >
      <ArrowLeft size={20} aria-hidden />
    </Link>
  );
}

function PrimaryAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-teal px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90 sm:w-auto"
    >
      {children}
      <ArrowRight size={17} aria-hidden />
    </button>
  );
}

function FocusRows({
  items,
}: {
  items: Array<{ icon: ReactNode; title: string; detail: string }>;
}) {
  return (
    <div className="divide-y divide-line/80 border-y border-line/80">
      {items.map((item) => (
        <div key={item.title} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 py-4">
          <span className="mt-0.5 text-teal" aria-hidden>
            {item.icon}
          </span>
          <div>
            <h3 className="text-[14.5px] font-semibold text-ink">{item.title}</h3>
            <p className="mt-1 text-[13.5px] leading-6 text-ink-soft">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper pb-[104px] text-ink">
      <main className="mx-auto w-full max-w-[1160px] px-5 pb-12 pt-6 sm:px-7 lg:px-8 lg:pt-8">
        {children}
      </main>
      <BottomTabBar active="Home" />
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
      <div className="grid gap-10 lg:grid-cols-[minmax(0,720px)_320px] lg:gap-14">
        <div className="min-w-0">
          <ProductHeader
            name="TaxSnap"
            subtitle="SARS and other South African tax letters"
            icon={<Receipt size={21} strokeWidth={1.9} />}
            tint={solution.tint}
          />

          <section className="mt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-teal">
              Received something from SARS?
            </p>
            <h2 className="mt-2 max-w-3xl text-[29px] font-semibold leading-[1.16] tracking-[-0.035em] text-ink sm:text-[36px]">
              Understand what it means and what you need to do next.
            </h2>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-7 text-ink-soft">
              Upload the letter, notice or assessment. TaxSnap identifies the document and explains
              the important action, dates, amounts and consequences in plain language.
            </p>

            <div className="mt-6">
              <PrimaryAction onClick={start}>Check my SARS document</PrimaryAction>
            </div>

            <div className="mt-4 flex items-start gap-2.5 text-[13px] leading-5 text-ink-soft">
              <FileCheck2 size={16} className="mt-0.5 shrink-0 text-teal" aria-hidden />
              <p>
                You do not need to know which SARS document you received. Upload it and TaxSnap will
                identify the supported document type first.
              </p>
            </div>
          </section>

          <section className="mt-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-soft">
              What TaxSnap helps you answer
            </p>
            <h2 className="mt-1.5 text-[20px] font-semibold text-ink">
              The things you need to know before the paperwork becomes a problem
            </h2>
            <div className="mt-5">
              <FocusRows
                items={[
                  {
                    icon: <FileText size={18} />,
                    title: "What did SARS send me?",
                    detail: "A clear explanation of the notice or assessment and why it matters.",
                  },
                  {
                    icon: <Check size={18} />,
                    title: "What is SARS asking me to do?",
                    detail: "The required action is separated from background wording and optional steps.",
                  },
                  {
                    icon: <CalendarClock size={18} />,
                    title: "Which date actually matters?",
                    detail: "Important dates and confirmed deadlines are shown with their meaning.",
                  },
                  {
                    icon: <CircleDollarSign size={18} />,
                    title: "What money is involved?",
                    detail: "Amounts, penalties or payment-related figures are surfaced when the document supports them.",
                  },
                  {
                    icon: <AlertTriangle size={18} />,
                    title: "What happens if I ignore it?",
                    detail: "Material consequences are explained without turning every notice into an emergency.",
                  },
                ]}
              />
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:pt-[74px]">
          <div className="rounded-[16px] border border-line bg-white p-5 lg:sticky lg:top-24">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              After you upload
            </p>
            <ol className="mt-4 space-y-4">
              {[
                ["1", "Identify the document", "TaxSnap first works out what kind of SARS or tax document it is."],
                ["2", "Explain what matters", "You get the plain-language meaning, important dates, amounts and risks."],
                ["3", "Show the next action", "Where the document supports it, TaxSnap tells you what to do and where to respond."],
              ].map(([step, title, detail]) => (
                <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-dim text-[12px] font-semibold text-teal">
                    {step}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[13px] font-semibold text-ink">Examples TaxSnap can handle</p>
              <ul className="mt-2 space-y-2 text-[12.5px] leading-5 text-ink-soft">
                <li>Verification and supporting-document requests</li>
                <li>Assessments, penalties and payment notices</li>
                <li>Objection, appeal and correction correspondence</li>
                <li>Customs and other supported SARS notices</li>
              </ul>
            </div>

            <p className="mt-5 border-t border-line pt-4 text-[11.5px] leading-5 text-ink-soft">
              Untangle South Africa is an AddVision product.
            </p>
          </div>
        </aside>
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
      <div className="grid gap-10 lg:grid-cols-[minmax(0,720px)_320px] lg:gap-14">
        <div className="min-w-0">
          <ProductHeader
            name="LeaseCheck"
            subtitle="Property, vehicle and equipment agreements"
            icon={<Home size={21} strokeWidth={1.9} />}
            tint={solution.tint}
          />

          <section className="mt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-teal">
              Before you sign — or when something changes
            </p>
            <h2 className="mt-2 max-w-3xl text-[29px] font-semibold leading-[1.16] tracking-[-0.035em] text-ink sm:text-[36px]">
              Understand the agreement, your commitments and what could happen if things go wrong.
            </h2>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-7 text-ink-soft">
              LeaseCheck explains the money, responsibilities, important clauses and ending/default
              terms in plain language, using the type of agreement and the facts in your document.
            </p>

            {available ? (
              <div className="mt-6">
                <PrimaryAction onClick={start}>Check my agreement</PrimaryAction>
              </div>
            ) : (
              <div className="mt-6 border-l-4 border-stamp-amber bg-amber-50 px-4 py-3">
                <p className="text-[14px] font-semibold text-ink">LeaseCheck is not enabled yet</p>
                <p className="mt-1 text-[13px] leading-5 text-ink-soft">
                  The specialist experience is ready for the release gate, but uploads stay closed until the product is enabled.
                </p>
              </div>
            )}
          </section>

          <section className="mt-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-soft">
              Start from where you are
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="border-t-2 border-teal bg-white px-5 py-5">
                <p className="text-[16px] font-semibold text-ink">Before I sign</p>
                <p className="mt-2 text-[13.5px] leading-6 text-ink-soft">
                  Understand what you will pay, what you are responsible for, clauses to check and how the agreement can end.
                </p>
              </div>
              <div className="border-t-2 border-stamp-amber bg-white px-5 py-5">
                <p className="text-[16px] font-semibold text-ink">I already have an agreement</p>
                <p className="mt-2 text-[13.5px] leading-6 text-ink-soft">
                  Understand an amendment, renewal, breach/default notice, cancellation, return or repossession-related document.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-soft">
              What LeaseCheck focuses on
            </p>
            <div className="mt-4">
              <FocusRows
                items={[
                  {
                    icon: <CircleDollarSign size={18} />,
                    title: "Money and total commitment",
                    detail: "Payments, fees, total repayment and balloon/residual amounts when they are actually stated or validated.",
                  },
                  {
                    icon: <Users size={18} />,
                    title: "Who is responsible for what",
                    detail: "Your obligations are separated from the landlord, lessor, finance provider or other party’s responsibilities.",
                  },
                  {
                    icon: <FileText size={18} />,
                    title: "Important clauses",
                    detail: "Terms that materially affect your cost, use of the asset/property or ability to end the agreement are brought forward.",
                  },
                  {
                    icon: <AlertTriangle size={18} />,
                    title: "If things go wrong",
                    detail: "Default, breach, cancellation, return or repossession consequences are explained from the document and approved rules.",
                  },
                  {
                    icon: <Scale size={18} />,
                    title: "Legal protections where they apply",
                    detail: "LeaseCheck applies legal guidance only when the agreement type and facts safely support it.",
                  },
                ]}
              />
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:pt-[74px]">
          <div className="rounded-[16px] border border-line bg-white p-5 lg:sticky lg:top-24">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              Agreement types
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "Residential property leases",
                "Commercial property leases",
                "Vehicle lease or rental agreements",
                "Equipment lease or hire agreements",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-5 text-ink">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[13px] font-semibold text-ink">It can also explain later documents</p>
              <p className="mt-2 text-[12.5px] leading-5 text-ink-soft">
                Amendments, renewals, breach/default notices, terminations, cancellations and return/repossess notices are treated according to their role in the agreement.
              </p>
            </div>

            <div className="mt-5 flex gap-2.5 border-t border-line pt-4">
              <Scale size={17} className="mt-0.5 shrink-0 text-teal" aria-hidden />
              <p className="text-[11.5px] leading-5 text-ink-soft">
                LeaseCheck does not assume a law applies merely because a document is called a lease.
              </p>
            </div>

            <p className="mt-5 border-t border-line pt-4 text-[11.5px] leading-5 text-ink-soft">
              Untangle South Africa is an AddVision product.
            </p>
          </div>
        </aside>
      </div>
    </PageFrame>
  );
}

export function GenericSolutionEntry({ solution }: { solution: Solution }) {
  const Icon = solution.icon;

  return (
    <PageFrame>
      <BackToHome />
      <div className="mx-auto max-w-3xl">
        <ProductHeader
          name={solution.name}
          subtitle={solution.shortDescription}
          icon={<Icon size={21} strokeWidth={1.9} />}
          tint={solution.tint}
        />

        <section className="mt-8">
          <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink">
            {solution.description}
          </h2>
          <div className="mt-6 rounded-[14px] border border-line bg-white p-5">
            <p className="text-[15px] font-semibold text-ink">Coming soon</p>
            <p className="mt-2 text-[13.5px] leading-6 text-ink-soft">
              {solution.name} belongs to the Untangle South Africa portfolio, but customer document analysis is not enabled yet.
            </p>
          </div>
        </section>

        <section className="mt-9">
          <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-soft">
            What it will help you understand
          </p>
          <ul className="mt-4 space-y-3">
            {solution.helps.map((item) => (
              <li key={item} className="flex gap-3 text-[14px] leading-6 text-ink">
                <Check size={17} className="mt-1 shrink-0 text-teal" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageFrame>
  );
}
