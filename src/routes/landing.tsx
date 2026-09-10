import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth/useAuth";
import welcomeImage from "@/assets/welcome-mountains.jpg";
import { BlockCard } from "@/components/untangle/BlockCard";
import { StampBadge } from "@/components/untangle/StampBadge";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { ProductRow } from "@/components/untangle/ProductRow";
import { AccordionItem } from "@/components/untangle/Accordion";
import { SOLUTION_LIST } from "@/lib/solutions";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Untangle — Real documents. Clear answers." },
      {
        name: "description",
        content:
          "Upload a South African tax notice, residential lease, insurance policy or employment document. Untangle explains what it means, what matters and what to do next, in plain language.",
      },
      { property: "og:title", content: "Untangle — Real documents. Clear answers." },
      {
        property: "og:description",
        content:
          "Plain-language explanations of South African tax notices, leases, insurance policies and employment documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/landing" },
    ],
    links: [{ rel: "canonical", href: "/landing" }],
  }),
  component: Landing,
});

const STEPS = [
  { title: "Upload it", desc: "Take a photo or choose a PDF." },
  {
    title: "We analyse it",
    desc: "Untangle works out what type of document it is and identifies the important information.",
  },
  {
    title: "Get the plain-language version",
    desc: "See what it means, what matters and what you may need to do.",
  },
  {
    title: "Stay ahead of important dates",
    desc: "Create reminders for reliable dates and deadlines.",
  },
];

const QUESTIONS = [
  {
    label: "TaxSnap",
    title: "What does this SARS notice actually mean?",
    answer:
      "Untangle explains the type of notice, what SARS is asking for, the amounts involved and which action matters next.",
  },
  {
    label: "LeaseCheck",
    title: "How much notice does my lease require?",
    answer:
      "Untangle surfaces the notice period written into your lease, along with deposits, escalation and responsibilities.",
  },
  {
    label: "PolicyCheck",
    title: "Why was my insurance claim rejected?",
    answer:
      "Untangle explains the reason recorded in the decision letter, the policy terms it relies on and the escalation route available to you.",
  },
  {
    label: "WorkCheck",
    title: "What does this clause in my employment contract mean?",
    answer:
      "Untangle translates contract and workplace wording into everyday language and highlights terms worth a closer look.",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[26px] font-semibold leading-tight md:text-[32px]">
      {children}
    </h2>
  );
}

function Landing() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  // Signed-in visitors go straight to their Home.
  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  const toUpload = () => navigate({ to: "/upload", search: {} });
  const scrollToHow = () =>
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-[10px] w-[10px] shrink-0 rounded-full bg-teal" aria-hidden />
            <span className="font-display text-[20px] font-semibold">Untangle</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/login"
              search={{ redirect: undefined }}
              className="flex min-h-[44px] items-center rounded-[12px] px-3 text-[14px] font-semibold text-ink"
            >
              Sign in
            </Link>
            <PrimaryButton
              onClick={toUpload}
              className="w-auto min-h-[44px] px-4 py-[10px] text-[14px]"
            >
              Try it free
            </PrimaryButton>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={welcomeImage}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[320px] w-full object-cover opacity-[0.18]"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(245,247,245,0.4) 0%, rgba(245,247,245,0.85) 55%, var(--paper) 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2 md:items-center md:py-16">
          <div>
            <span className="inline-block rounded-full bg-teal-dim px-3 py-[6px] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-teal">
              Built for South Africa
            </span>
            <h1 className="mt-5 font-display text-[34px] font-semibold leading-[1.12] md:text-[46px]">
              Confusing document?
              <br />
              <span className="text-teal">Untangle it.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft">
              Upload a South African tax notice, residential lease, insurance policy or employment
              document. Untangle explains what it means, highlights what matters and gives you clear
              next steps in plain language.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton onClick={toUpload} className="sm:w-auto sm:px-6">
                Upload your first document — free
              </PrimaryButton>
              <SecondaryButton onClick={scrollToHow} className="sm:w-auto sm:px-6">
                See how it works
              </SecondaryButton>
            </div>
            <p className="mt-4 text-[12.5px] text-ink-soft">
              Private documents. Secure processing. Plain-language guidance.
            </p>
          </div>

          {/* REAL EXAMPLE */}
          <div>
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              From document to clear next steps
            </p>
            <BlockCard title="TaxSnap" action={<StampBadge label="Urgent" color="red" />}>
              <h2 className="text-[20px] font-semibold leading-snug text-ink">
                SARS wants R4,200 paid by 14 Jul
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                A demand for an outstanding assessment. If nothing is paid or disputed by the
                deadline, interest and collection steps may follow.
              </p>
              <BlockCard title="What you need to do" className="mt-4 bg-paper">
                <ul className="space-y-2 text-[14px]">
                  {[
                    "Pay R4,200 using the stated reference",
                    "Or dispute it before the stated deadline",
                  ].map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <span className="mt-[2px] grid h-[16px] w-[16px] shrink-0 place-items-center rounded-[4px] border-[1.5px] border-line bg-white text-[10px] text-teal">
                        ✓
                      </span>
                      <span>{row}</span>
                    </li>
                  ))}
                </ul>
              </BlockCard>
              <p className="mt-3 text-[11.5px] text-ink-soft">
                Illustrative example — not a real document.
              </p>
            </BlockCard>
          </div>
        </div>
      </section>

      {/* PROBLEM / VALUE */}
      <section className="bg-paper-2 px-5 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading>
            Important documents shouldn't be this difficult to understand
          </SectionHeading>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">
            A notice, contract or policy can contain pages of formal language while only a few
            details actually matter. Untangle helps surface those details and explains them in
            everyday language.
          </p>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <SectionHeading>What Untangle covers</SectionHeading>
        <div className="mt-6 space-y-3">
          {SOLUTION_LIST.map((solution) => (
            <ProductRow key={solution.slug} solution={solution} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-20 bg-paper-2 px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <SectionHeading>How it works</SectionHeading>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-3">
                <span className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full bg-teal font-mono text-[12px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMON QUESTIONS */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <SectionHeading>Questions people actually ask</SectionHeading>
        <div className="mt-4 rounded-2xl border border-line bg-white px-4">
          {QUESTIONS.map((q) => (
            <AccordionItem key={q.title} label={q.label} title={q.title}>
              {q.answer}
            </AccordionItem>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-ink px-5 py-12 text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-[24px] font-semibold leading-tight md:text-[30px]">
            Clear information. Important decisions stay yours.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">
            Untangle explains what a document says in everyday language. It does not replace a
            lawyer, tax practitioner, accountant or other professional, and it does not act or make
            decisions on your behalf.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75">
            Your documents are handled according to Untangle's privacy and retention rules.
          </p>
          <a
            href="#disclaimer"
            className="mt-4 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-white underline underline-offset-4"
          >
            Read our disclaimer
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-12 text-center">
        <div className="mx-auto max-w-xl">
          <SectionHeading>Stop guessing what the document means.</SectionHeading>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
            Upload your first document and get a clear explanation of what matters.
          </p>
          <div className="mx-auto mt-6 max-w-sm">
            <PrimaryButton onClick={toUpload}>Upload your first document — free</PrimaryButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line px-5 py-8 pb-[110px] min-[720px]:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-[13px] text-ink-soft md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Untangle</p>
          <div className="flex gap-4">
            <a href="#privacy" className="inline-flex min-h-[44px] items-center px-1">
              Privacy
            </a>
            <a
              id="disclaimer"
              href="#disclaimer"
              className="inline-flex min-h-[44px] items-center px-1"
            >
              Disclaimer
            </a>
            <a href="#contact" className="inline-flex min-h-[44px] items-center px-1">
              Contact
            </a>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-6xl text-center text-[11.5px] text-ink-soft/80 md:text-left">
          Untangle — an AddVision product
        </p>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] min-[720px]:hidden">
        <Link
          to="/upload"
          search={{}}
          className="flex min-h-[48px] w-full items-center justify-center rounded-[14px] bg-teal px-4 text-center text-[15px] font-semibold text-white"
        >
          Upload a document — free
        </Link>
      </div>
    </div>
  );
}
