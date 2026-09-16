import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Privacy — Untangle by AddVision" },
      {
        name: "description",
        content:
          "How Untangle works, how your documents are handled and stored, and the terms that apply when you use Untangle, an AddVision product.",
      },
      { property: "og:title", content: "Terms and Privacy — Untangle by AddVision" },
      {
        property: "og:description",
        content:
          "How Untangle works, how your documents are handled and stored, and the terms that apply when you use Untangle, an AddVision product.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-display text-[17px] font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-2.5 text-[13.5px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

function Terms() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line/60 bg-paper/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <Link
          to="/landing"
          className="inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-ink"
        >
          <ArrowLeft size={18} aria-hidden />
          Back
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-4">
        <h1 className="font-display text-[24px] font-semibold leading-tight text-ink">
          Terms and Privacy
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          Untangle is a product of AddVision. These terms explain what Untangle does, how your
          documents are handled and what you can expect when you use it.
        </p>

        <Section title="What Untangle does">
          <p>
            Untangle reads a document you upload and explains, in everyday language, what it says,
            which terms matter and what you may want to do next.
          </p>
          <p>
            Untangle is not a law firm, tax practitioner or financial adviser. It does not give
            legal or financial advice, and it does not act on your behalf. Important decisions stay
            yours, and you should confirm anything significant against the original document or with
            a suitable professional.
          </p>
        </Section>

        <Section title="Your documents and your privacy">
          <p>
            Documents you upload are sent over an encrypted connection and stored in private
            storage. Only your account can open your documents and their results.
          </p>
          <p>
            Documents are used to produce your result and to operate the service. They are not sold,
            and they are not shared with other customers.
          </p>
          <p>
            Documents are kept according to the retention period of your plan, which is shown on
            your profile. You can delete a document at any time from your Vault, which removes the
            stored file and its result.
          </p>
          <p>
            Untangle uses third-party processing services to read documents and produce results.
            Those services are used under agreements that limit them to processing on Untangle's
            behalf.
          </p>
        </Section>

        <Section title="Your account">
          <p>
            You are responsible for keeping your sign-in details private and for the documents you
            upload. Only upload documents you are entitled to share.
          </p>
        </Section>

        <Section title="Accuracy">
          <p>
            Untangle reads real documents and can miss or misread wording, especially in scans and
            photographs. Where Untangle is not confident, it says so and asks you to check the
            original. Untangle does not guarantee that a result is complete or error-free.
          </p>
        </Section>

        <Section title="Payments">
          <p>
            Paid plans are billed through a secure payment provider. Untangle does not receive or
            store your banking credentials. Plan limits and pricing are shown before you pay.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions about these terms, your documents or a deletion request, contact AddVision
            support from your profile page.
          </p>
        </Section>

        <p className="mt-9 text-[12px] text-ink-soft/80">Untangle — an AddVision product</p>
      </main>
    </div>
  );
}
