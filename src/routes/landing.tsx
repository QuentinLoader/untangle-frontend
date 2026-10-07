import { useEffect, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { PublicSiteShell } from "@/components/untangle/public/PublicSiteShell";
import { SOLUTION_LIST } from "@/lib/solutions";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Untangle South Africa — Important documents, explained clearly" },
      {
        name: "description",
        content:
          "Understand SARS letters, agreements, insurance documents and employment paperwork in plain language with Untangle South Africa.",
      },
      {
        property: "og:title",
        content: "Untangle South Africa — Important documents, explained clearly",
      },
      {
        property: "og:description",
        content: "Understand the paperwork. Know what matters. Know what to do next.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

export function LandingPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/home", replace: true });
    }
  }, [loading, session, navigate]);

  if (loading || session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper" aria-busy="true">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-teal" />
      </div>
    );
  }

  return (
    <PublicSiteShell>
      <main>
        <section className="mx-auto max-w-[1180px] px-5 pb-12 pt-11 sm:px-7 md:pt-16 lg:px-8 lg:pb-16">
          <div className="max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-teal">
              Built for South Africa
            </p>
            <h1 className="mt-3 text-[38px] font-semibold leading-[1.06] tracking-[-0.045em] text-ink sm:text-[50px] lg:text-[58px]">
              Important documents, explained clearly.
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-ink-soft">
              Untangle South Africa helps you understand the paperwork that can affect your money,
              work, home and decisions — without making you decode the jargon first.
            </p>

            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                to="/signup"
                search={{ redirect: "/home" }}
                className="inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-teal px-5 text-[14.5px] font-semibold text-white"
              >
                Create a free account
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                to="/login"
                search={{ redirect: "/home" }}
                className="inline-flex min-h-11 items-center px-2 text-[13.5px] font-semibold text-teal"
              >
                I already have an account
              </Link>
            </div>

            <p className="mt-3 text-[12.5px] text-ink-soft">
              Start free with up to 3 successful analyses per month.
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto max-w-[1180px] px-5 py-11 sm:px-7 lg:px-8 lg:py-14">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              Specialist tools
            </p>
            <h2 className="mt-2 max-w-2xl text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">
              Start with the problem you are dealing with.
            </h2>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {SOLUTION_LIST.map((solution) => {
                const Icon = solution.icon;
                const livePath =
                  solution.slug === "taxsnap"
                    ? "/taxsnap"
                    : solution.slug === "leasecheck"
                      ? "/leasecheck"
                      : null;
                const accent =
                  solution.slug === "taxsnap"
                    ? "var(--stamp-red)"
                    : solution.slug === "leasecheck"
                      ? "var(--teal)"
                      : "var(--line)";

                const card = (
                  <div
                    className="h-full border border-line bg-paper px-5 py-5 transition-colors hover:bg-white"
                    style={{ borderTopWidth: 3, borderTopColor: accent }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                        style={{ backgroundColor: solution.tint, color: accent }}
                        aria-hidden
                      >
                        <Icon size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-[17px] font-semibold text-ink">{solution.name}</h3>
                          {!livePath ? (
                            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-ink-soft">
                              Coming soon
                            </span>
                          ) : (
                            <ArrowRight size={17} className="text-ink-soft" aria-hidden />
                          )}
                        </div>
                        <p className="mt-2 text-[13px] leading-5 text-ink-soft">
                          {solution.shortDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return livePath ? (
                  <Link key={solution.slug} to={livePath as never} className="block">
                    {card}
                  </Link>
                ) : (
                  <div key={solution.slug}>{card}</div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-11 sm:px-7 lg:px-8 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                How Untangle works
              </p>
              <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">
                The answer first. The detail when you need it.
              </h2>

              <ol className="mt-6 space-y-5">
                {[
                  [
                    "1",
                    "Choose the specialist tool",
                    "TaxSnap and LeaseCheck are available now; more tools will join the portfolio later.",
                  ],
                  ["2", "Upload the document", "Use the original PDF, image or a clear photo."],
                  [
                    "3",
                    "See what matters",
                    "Untangle gives you the 30-second answer first, then the practical meaning and full evidence.",
                  ],
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

            <div className="border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                Designed for real decisions
              </p>

              <div className="mt-5 space-y-5">
                <TrustItem
                  icon={<FileText size={18} />}
                  title="Plain language, not more jargon"
                  body="The first view tells you what the document is, what matters and what you may need to do."
                />
                <TrustItem
                  icon={<LockKeyhole size={18} />}
                  title="Private to your account"
                  body="Documents and results sit behind your authenticated Untangle account."
                />
                <TrustItem
                  icon={<ShieldCheck size={18} />}
                  title="Evidence stays available"
                  body="When you want the detail, you can go deeper into the source wording and checked guidance."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-paper-2">
          <div className="mx-auto max-w-[1180px] px-5 py-11 sm:px-7 lg:px-8">
            <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Start free
                </p>
                <h2 className="mt-2 text-[24px] font-semibold text-ink">
                  3 successful analyses per month
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-ink-soft">
                  Create an account and use the available specialist tools before deciding whether
                  you need more.
                </p>
              </div>

              <div className="border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Untangle Plus
                </p>
                <h2 className="mt-2 text-[24px] font-semibold text-ink">R79 / month</h2>
                <p className="mt-2 text-[13px] leading-6 text-ink-soft">
                  More analyses plus portfolio features such as Vault/history and reminders where
                  supported.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ink px-5 py-11 text-white">
          <div className="mx-auto flex max-w-[900px] flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">
                Understand the document before it becomes the problem.
              </h2>
              <p className="mt-2 text-[13.5px] text-white/70">
                Create your free Untangle South Africa account.
              </p>
            </div>
            <Link
              to="/signup"
              search={{ redirect: "/home" }}
              className="inline-flex min-h-[48px] items-center rounded-xl bg-white px-5 text-[14px] font-semibold text-ink"
            >
              Create free account
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}

function TrustItem({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[26px_minmax(0,1fr)] gap-3">
      <span className="mt-0.5 text-teal" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
