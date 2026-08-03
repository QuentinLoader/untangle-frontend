import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BlockCard } from "@/components/untangle/BlockCard";
import { StampBadge } from "@/components/untangle/StampBadge";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Untangle — Confusing official letter? Untangle it in 10 seconds" },
      {
        name: "description",
        content:
          "Upload any SARS letter, lease, purchase agreement or job offer and get a plain-English explanation, what to do next, and a reminder before the deadline.",
      },
      {
        property: "og:title",
        content: "Untangle — Confusing official letter? Untangle it in 10 seconds",
      },
      {
        property: "og:description",
        content:
          "Plain-English explanations of South African letters, leases and contracts — no jargon, no panic.",
      },
      { property: "og:url", content: "/landing" },
    ],
    links: [{ rel: "canonical", href: "/landing" }],
  }),
  component: Landing,
});

const MODULES = [
  {
    name: "TaxSnap",
    icon: "📨",
    iconBg: "#FBEAE5",
    tag: "SARS letters",
    color: "var(--stamp-red)",
    desc: "Assessments, penalties and letters of demand explained — what's owed, by when, and what happens if you wait.",
  },
  {
    name: "LeaseCheck",
    icon: "🏠",
    iconBg: "var(--teal-dim)",
    tag: "Rentals",
    color: "var(--teal)",
    desc: "Deposits, notice periods and escalation clauses in your lease, translated into what they mean for you.",
  },
  {
    name: "DealCheck",
    icon: "📝",
    iconBg: "#F3EBDC",
    tag: "Agreements",
    color: "var(--stamp-amber)",
    desc: "Purchase and sale agreements read line by line so you know what you're signing before you sign it.",
  },
  {
    name: "WorkCheck",
    icon: "💼",
    iconBg: "#E6EAF6",
    tag: "Job offers",
    color: "var(--module-blue)",
    desc: "Probation, restraint of trade and notice terms in an offer of employment, flagged in plain language.",
  },
];

const STEPS = [
  { title: "Snap or upload", desc: "Photograph the letter or pick a PDF from your phone." },
  { title: "We read it", desc: "Untangle works out what kind of document it is on its own." },
  { title: "Get plain English", desc: "A short summary, the amounts, and what you need to do." },
  { title: "Never miss a deadline", desc: "We remind you before the date that matters." },
];

const TEASERS = [
  {
    tag: "TaxSnap",
    color: "var(--stamp-red)",
    title: "What is a SARS letter of demand?",
    desc: "Why it arrives, what the amount means, and how long you actually have to respond.",
  },
  {
    tag: "LeaseCheck",
    color: "var(--teal)",
    title: "How much notice must I give my landlord?",
    desc: "The notice period in your lease versus what the Rental Housing Act expects.",
  },
  {
    tag: "WorkCheck",
    color: "var(--module-blue)",
    title: "Is a probation clause normal?",
    desc: "What a fair probation period looks like in a South African offer of employment.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const toUpload = () => navigate({ to: "/upload" });

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* NAV */}
      <header className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:grid-cols-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-[10px] w-[10px] shrink-0 rounded-full bg-teal" />
            <span className="font-display text-[20px] font-semibold">Untangle</span>
          </div>
          <nav className="hidden items-center justify-center gap-6 text-[14px] text-ink-soft md:flex">
            {MODULES.map((m) => (
              <span key={m.name}>{m.name}</span>
            ))}
          </nav>
          <div className="flex justify-end">
            <PrimaryButton onClick={toUpload} className="w-auto px-5 py-[10px] text-[14px]">
              Try it free
            </PrimaryButton>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <span className="inline-block rounded-full bg-teal-dim px-3 py-[6px] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-teal">
            Built for South Africa
          </span>
          <h1 className="mt-5 font-display text-[30px] font-semibold leading-[1.15] md:text-[46px]">
            Confusing official letter?
            <br />
            <span className="text-teal">Untangle it in 10 seconds.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft">
            Upload any SARS letter, lease, purchase agreement or job offer. Get a plain-English
            explanation, what you need to do, and a reminder before the deadline — no jargon, no
            panic.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={toUpload} className="sm:w-auto sm:px-6">
              Upload your first document — free
            </PrimaryButton>
            <SecondaryButton onClick={toUpload} className="sm:w-auto sm:px-6">
              See how it works
            </SecondaryButton>
          </div>
          <p className="mt-4 text-[12.5px] text-ink-soft">
            🔒 Your documents stay private · Informational only, never legal or tax advice
          </p>
        </div>

        <BlockCard title="TaxSnap" action={<StampBadge label="Urgent" color="red" />}>
          <h2 className="font-display text-[22px] font-semibold leading-snug">
            SARS wants R4,200 paid by 14 Jul
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            This is a letter of demand for an outstanding assessment. If nothing is paid or disputed
            by 14 July, SARS may add interest and hand it over for collection.
          </p>
          <BlockCard title="What you need to do" className="mt-4 bg-paper">
            <ul className="space-y-2 text-[14px]">
              {["Pay R4,200 using reference 9012345678", "Or file a dispute before 14 Jul"].map(
                (row) => (
                  <li key={row} className="flex items-start gap-2">
                    <span className="mt-[2px] grid h-[16px] w-[16px] shrink-0 place-items-center rounded-[4px] border-[1.5px] border-line bg-white text-[10px] text-teal">
                      ✓
                    </span>
                    <span>{row}</span>
                  </li>
                ),
              )}
            </ul>
          </BlockCard>
        </BlockCard>
      </section>

      {/* PROBLEM STRIP */}
      <section className="bg-paper-2 px-5 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[26px] font-semibold md:text-[32px]">
            Official letters are written for lawyers, not for you
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            A letter arrives, it uses words nobody explains, and somewhere inside it is a date and
            an amount that actually matter. Most people put it in a drawer and hope. Untangle reads
            it and tells you the two or three things you genuinely need to know.
          </p>
        </div>
      </section>

      {/* MODULES */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {MODULES.map((m) => (
            <div key={m.name} className="rounded-[18px] border border-line bg-white p-5">
              <div
                className="grid h-[44px] w-[44px] place-items-center rounded-[12px] text-xl"
                style={{ backgroundColor: m.iconBg }}
                aria-hidden
              >
                {m.icon}
              </div>
              <h3 className="mt-4 font-display text-[19px] font-semibold">{m.name}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{m.desc}</p>
              <span
                className="mt-4 inline-block font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]"
                style={{ color: m.color }}
              >
                {m.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-paper-2 px-5 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-[26px] font-semibold md:text-[32px]">
            How it works
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-teal font-mono text-[13px] font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[15px] font-bold">{s.title}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO TEASER */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-[26px] font-semibold md:text-[32px]">
          Questions people actually ask
        </h2>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-ink-soft">
          Short, plain-English answers to the things that show up in South African letters,
          contracts and offers.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TEASERS.map((t) => (
            <a
              key={t.title}
              href="#"
              className="block rounded-[18px] border border-line bg-white p-5 transition-colors hover:bg-paper"
            >
              <span
                className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]"
                style={{ color: t.color }}
              >
                {t.tag}
              </span>
              <h3 className="mt-3 font-display text-[18px] font-semibold leading-snug">
                {t.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{t.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-ink px-5 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-[26px] font-semibold md:text-[32px]">
            Informational, not legal or tax advice
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-white/75">
            Untangle explains what a document says in everyday language. It does not replace an
            attorney, a tax practitioner or an accountant, and it cannot represent you or make
            decisions on your behalf.
          </p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-white/75">
            Your documents stay private. We use them to produce your summary and reminders, nothing
            else. If something has serious money or legal consequences, take the plain-English
            summary to a professional — you'll just walk in knowing what to ask.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="font-display text-[26px] font-semibold md:text-[32px]">
            Stop guessing what that letter means
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
            Upload your first document free and see it in plain English in about ten seconds.
          </p>
          <div className="mx-auto mt-6 max-w-sm">
            <PrimaryButton onClick={toUpload}>Upload a document — free</PrimaryButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line px-5 py-8 pb-[110px] md:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-[13px] text-ink-soft md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Untangle</p>
          <div className="flex gap-5">
            <a href="#">Privacy</a>
            <a href="#">Disclaimer</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] min-[720px]:hidden">
        <Link to="/upload" className="block">
          <PrimaryButton>📷 Upload a document — free</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
