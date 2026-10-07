import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  FileSearch,
  LockKeyhole,
  Receipt,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { PublicSiteShell } from "./PublicSiteShell";

export type PublicSpecialist = "taxsnap" | "leasecheck";

type PageConfig = {
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  cta: string;
  signedInCta: string;
  accent: string;
  tint: string;
  icon: LucideIcon;
  benefits: Array<{ title: string; detail: string }>;
  exampleTitle: string;
  exampleInput: string;
  exampleOutput: Array<{ label: string; value: string }>;
  supporting: string;
};

const CONFIG: Record<PublicSpecialist, PageConfig> = {
  taxsnap: {
    name: "TaxSnap",
    eyebrow: "SARS letters, notices and assessments",
    headline: "Got something from SARS and not sure what it means?",
    intro:
      "TaxSnap explains what SARS sent you, what they want from you, which dates and amounts matter, and what you may need to do next.",
    cta: "Create a free account",
    signedInCta: "Open TaxSnap",
    accent: "var(--stamp-red)",
    tint: "var(--tint-red)",
    icon: Receipt,
    benefits: [
      {
        title: "Know what SARS is asking",
        detail: "The required action is separated from background wording and optional information.",
      },
      {
        title: "See dates and money clearly",
        detail: "Important deadlines and amounts are brought forward when the document confirms them.",
      },
      {
        title: "Understand what happens next",
        detail: "TaxSnap explains the practical consequence without turning every letter into an emergency.",
      },
    ],
    exampleTitle: "From official wording to a clear next step",
    exampleInput: "A SARS notice with formal wording, dates, reference numbers and payment information.",
    exampleOutput: [
      { label: "What this is", value: "A payment-related SARS notice" },
      { label: "What matters", value: "A confirmed amount and response date" },
      { label: "What to do", value: "See the required action and where to respond" },
    ],
    supporting:
      "You do not need to know which SARS document type you received before you start.",
  },
  leasecheck: {
    name: "LeaseCheck",
    eyebrow: "Property, vehicle and equipment agreements",
    headline: "Know what you are committing to before you sign.",
    intro:
      "LeaseCheck explains the money, responsibilities, important clauses and what can happen if the agreement changes, ends or goes wrong.",
    cta: "Create a free account",
    signedInCta: "Open LeaseCheck",
    accent: "var(--teal)",
    tint: "var(--teal-dim)",
    icon: WalletCards,
    benefits: [
      {
        title: "See the real financial commitment",
        detail: "Payments, fees and end-of-term amounts are surfaced when the result confirms them.",
      },
      {
        title: "Know who is responsible for what",
        detail: "Your duties are separated from the landlord, lessor, finance provider or other party.",
      },
      {
        title: "Understand clauses and consequences",
        detail: "Important terms, ending/default consequences and applicable protections are explained plainly.",
      },
    ],
    exampleTitle: "From agreement wording to a decision you can understand",
    exampleInput: "A 72-month vehicle agreement with monthly payments, fees and a final balloon amount.",
    exampleOutput: [
      { label: "Monthly payment", value: "R9,649.47" },
      { label: "Term", value: "72 months" },
      { label: "Final balloon", value: "R147,475.00" },
    ],
    supporting:
      "LeaseCheck can also help with amendments, renewals, default notices, cancellations and related documents.",
  },
};

export function PublicSpecialistLanding({ product }: { product: PublicSpecialist }) {
  const { session, loading } = useAuth();
  const config = CONFIG[product];
  const Icon = config.icon;
  const appPath = product === "taxsnap" ? "/solutions/taxsnap" : "/solutions/leasecheck";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper" aria-busy="true">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-teal" />
      </div>
    );
  }

  return (
    <PublicSiteShell signedIn={Boolean(session)}>
      <main>
        <section className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-12 pt-10 sm:px-7 md:pt-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:px-8 lg:pb-16 lg:pt-16">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-[14px]"
                style={{ backgroundColor: config.tint, color: config.accent }}
                aria-hidden
              >
                <Icon size={22} strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[18px] font-semibold text-ink">{config.name}</p>
                <p className="mt-0.5 text-[12px] text-ink-soft">Part of Untangle South Africa</p>
              </div>
            </div>

            <p
              className="mt-8 text-[12px] font-semibold uppercase tracking-[0.07em]"
              style={{ color: config.accent }}
            >
              {config.eyebrow}
            </p>

            <h1 className="mt-3 max-w-3xl text-[34px] font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-[44px] lg:text-[50px]">
              {config.headline}
            </h1>

            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-ink-soft">{config.intro}</p>

            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {session ? (
                <Link
                  to={appPath as never}
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-teal px-5 text-[14.5px] font-semibold text-white"
                >
                  {config.signedInCta}
                  <ArrowRight size={17} aria-hidden />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    search={{ redirect: appPath }}
                    className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-teal px-5 text-[14.5px] font-semibold text-white"
                  >
                    {config.cta}
                    <ArrowRight size={17} aria-hidden />
                  </Link>
                  <Link
                    to="/login"
                    search={{ redirect: appPath }}
                    className="inline-flex min-h-[44px] items-center px-2 text-[13.5px] font-semibold text-teal"
                  >
                    I already have an account
                  </Link>
                </>
              )}
            </div>

            <p className="mt-3 text-[12.5px] leading-5 text-ink-soft">
              Start free with up to 3 successful analyses per month.
            </p>
          </div>

          <aside className="self-start rounded-[18px] border border-line bg-white p-5 sm:p-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              What you get
            </p>
            <div className="mt-4 divide-y divide-line/80">
              {config.benefits.map((item) => (
                <div key={item.title} className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 py-4 first:pt-0 last:pb-0">
                  <Check size={17} className="mt-0.5 text-teal" aria-hidden />
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-7 lg:px-8 lg:py-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              A simple example
            </p>
            <h2 className="mt-2 max-w-2xl text-[24px] font-semibold tracking-[-0.02em] text-ink sm:text-[28px]">
              {config.exampleTitle}
            </h2>

            <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="border border-line bg-paper px-5 py-5">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Before
                </p>
                <div className="mt-4 flex gap-3">
                  <FileSearch size={20} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
                  <p className="text-[14px] leading-6 text-ink">{config.exampleInput}</p>
                </div>
              </div>

              <div className="border border-line bg-white px-5 py-5">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-teal">
                  After Untangle
                </p>
                <dl className="mt-3 divide-y divide-line/80">
                  {config.exampleOutput.map((item) => (
                    <div key={item.label} className="grid gap-1 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5">
                      <dt className="text-[12.5px] font-medium text-ink-soft">{item.label}</dt>
                      <dd className="text-[13.5px] font-semibold text-ink">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <p className="mt-4 text-[11.5px] text-ink-soft">Illustrative example only.</p>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-11 sm:px-7 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                How it works
              </p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-ink sm:text-[28px]">
                Upload. Understand. Decide what to do next.
              </h2>

              <ol className="mt-6 space-y-4">
                {[
                  ["1", "Create your account", "Your documents and results stay tied to your authenticated account."],
                  ["2", "Upload the document", "Use a PDF, image or a clear photo."],
                  ["3", "Get the specialist explanation", "See the important facts first, then open the deeper detail when you need it."],
                ].map(([number, title, detail]) => (
                  <li key={number} className="grid grid-cols-[30px_minmax(0,1fr)] gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-teal text-[12px] font-semibold text-white">
                      {number}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-ink">{title}</p>
                      <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-line pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex gap-3">
                <LockKeyhole size={19} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <div>
                  <p className="text-[14px] font-semibold text-ink">Your document stays behind your account</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                    Documents, results and account features require an authenticated Untangle session.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                <div>
                  <p className="text-[14px] font-semibold text-ink">Important decisions stay yours</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                    Untangle explains the document in plain language. It does not act as your lawyer, tax practitioner or financial adviser.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-[12.5px] leading-5 text-ink-soft">{config.supporting}</p>
            </div>
          </div>
        </section>

        <section className="bg-ink px-5 py-11 text-white">
          <div className="mx-auto flex max-w-[900px] flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">
                Stop guessing what the document means.
              </h2>
              <p className="mt-2 text-[13.5px] leading-6 text-white/70">
                Start with a free Untangle South Africa account.
              </p>
            </div>

            {session ? (
              <Link
                to={appPath as never}
                className="inline-flex min-h-[48px] items-center rounded-xl bg-white px-5 text-[14px] font-semibold text-ink"
              >
                {config.signedInCta}
              </Link>
            ) : (
              <Link
                to="/signup"
                search={{ redirect: appPath }}
                className="inline-flex min-h-[48px] items-center rounded-xl bg-white px-5 text-[14px] font-semibold text-ink"
              >
                Create free account
              </Link>
            )}
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
