import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
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
  component: LandingPage,
});

const STEPS = [
  { title: "Upload it", desc: "Take a photo or choose a PDF." },
  { title: "We analyse it", desc: "Untangle identifies the document and the details that matter." },
  {
    title: "Get the plain-language version",
    desc: "See what it means, what matters and what you may need to do.",
  },
  {
    title: "Stay ahead of dates",
    desc: "Create reminders for reliable deadlines.",
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
    <h2 className="font-display text-[24px] font-semibold leading-tight md:text-[30px]">
      {children}
    </h2>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  // Signed-in visitors go straight to their Home. (At "/" the gate shows Home
  // instead, so this only fires on /landing.)
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[10px] bg-teal text-white">
              <Leaf className="h-[16px] w-[16px]" aria-hidden />
            </span>
            <span className="font-display text-[19px] font-semibold">Untangle</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/login"
              search={{ redirect: undefined }}
              className="flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-[12px] px-3 text-[14px] font-semibold text-ink"
            >
              Sign in
            </Link>
            <PrimaryButton
              onClick={toUpload}
              className="min-h-[44px] w-auto whitespace-nowrap px-4 py-[10px] text-[14px]"
            >
              Try it free
            </PrimaryButton>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-9 md:py-14">
        <div className="mx-auto max-w-2xl md:mx-0">
          <span className="inline-block rounded-full bg-teal-dim px-3 py-[6px] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-teal">
            Built for South Africa
          </span>
          <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.12] md:text-[46px]">
            Confusing document?
            <br />
            <span className="text-teal">Untangle it.</span>
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            Upload a tax notice, lease, insurance policy or employment document. Untangle explains
            what it means and what to do next — in plain language.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={toUpload} className="sm:w-auto sm:px-6">
              Upload your first document — free
            </PrimaryButton>
            <SecondaryButton onClick={scrollToHow} className="sm:w-auto sm:px-6">
              See how it works
            </SecondaryButton>
          </div>
        </div>

        {/* MISTY MOUNTAINS */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-line">
          <img
            src={welcomeImage}
            alt="Misty mountains at dawn"
            className="h-[180px] w-full object-cover md:h-[240px]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
            aria-hidden
          />
          <p className="absolute bottom-3 left-4 text-[12.5px] font-medium text-white/95">
            Private documents. Secure processing. Plain-language guidance.
          </p>
        </div>

        {/* REAL EXAMPLE */}
        <div className="mt-6">
          <BlockCard title="TaxSnap" action={<StampBadge label="Urgent" color="red" />}>
            <h2 className="text-[19px] font-semibold leading-snug text-ink">
              SARS wants R4,200 paid by 14 Jul
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              A demand for an outstanding assessment. If nothing is paid or disputed by the
              deadline, interest and collection steps may follow.
            </p>
            <p className="mt-3 text-[11.5px] text-ink-soft">
              Illustrative example — not a real document.
            </p>
          </BlockCard>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-3xl px-5 py-9">
        <SectionHeading>What Untangle covers</SectionHeading>
        <div className="mt-5 space-y-3">
          {SOLUTION_LIST.map((solution) => (
            <ProductRow key={solution.slug} solution={solution} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-20 bg-paper-2 px-5 py-9">
        <div className="mx-auto max-w-3xl">
          <SectionHeading>How it works</SectionHeading>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-3">
                <span className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full bg-teal font-mono text-[12px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-soft">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMON QUESTIONS */}
      <section className="mx-auto max-w-3xl px-5 py-9">
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
      <section id="disclaimer" className="scroll-mt-24 bg-ink px-5 py-10 text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-[22px] font-semibold leading-tight md:text-[28px]">
            Clear information. Important decisions stay yours.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-white/75">
            Untangle explains what a document says in everyday language. It does not replace a
            lawyer, tax practitioner or accountant, and it does not act on your behalf. Your
            documents are handled according to Untangle's privacy and retention rules.
          </p>
          <a
            href="#disclaimer"
            className="mt-3 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-white underline underline-offset-4"
          >
            Read our disclaimer
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="final-cta" className="px-5 py-10 text-center">
        <div className="mx-auto max-w-xl">
          <SectionHeading>Stop guessing what the document means.</SectionHeading>
          <div className="mx-auto mt-5 max-w-sm">
            <PrimaryButton onClick={toUpload}>Upload your first document — free</PrimaryButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line px-5 py-8 pb-[110px] min-[720px]:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-[13px] text-ink-soft md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Untangle</p>
          <div className="flex gap-4">
            <a href="#privacy" className="inline-flex min-h-[44px] items-center px-1">
              Privacy
            </a>
            <a href="#disclaimer" className="inline-flex min-h-[44px] items-center px-1">
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

      {/* MOBILE STICKY CTA — hidden while the final CTA is on screen */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-200 min-[720px]:hidden ${
          finalCtaVisible ? "translate-y-full" : "translate-y-0"
        }`}
        aria-hidden={finalCtaVisible}
      >
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
