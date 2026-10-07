import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  HelpCircle,
  Info,
  MessageCircleQuestion,
  ShieldCheck,
} from "lucide-react";
import {
  AskPrompt,
  EvidenceDisclosure,
  FactRows,
  KeyMetric,
  MeaningBlock,
  ResultSection,
  StatusBadge,
} from "./ResultPrimitives";
import { ResultWorkspace, type WorkspaceNavItem } from "./ResultWorkspace";

const NAV: WorkspaceNavItem[] = [
  { id: "summary", label: "Summary" },
  { id: "meaning", label: "What this means" },
  { id: "money", label: "Your money" },
  { id: "cover", label: "Your cover" },
  { id: "limits", label: "Limits & exclusions" },
  { id: "conditions", label: "Important conditions" },
  { id: "heads-up", label: "Heads up" },
  { id: "claim", label: "Claim decision" },
  { id: "questions", label: "Questions to ask" },
  { id: "evidence", label: "Evidence" },
  { id: "ask", label: "Ask" },
];

type CoverStatus =
  | "CONFIRMED_INCLUDED"
  | "DESCRIBED_NOT_CONFIRMED"
  | "EXPLICITLY_NOT_COVERED"
  | "NOT_ESTABLISHED";

function coverStatusLabel(status: CoverStatus) {
  if (status === "CONFIRMED_INCLUDED") return "Confirmed purchased cover";
  if (status === "DESCRIBED_NOT_CONFIRMED") return "Described, not confirmed";
  if (status === "EXPLICITLY_NOT_COVERED") return "Not covered";
  return "Not established";
}

function coverStatusTone(status: CoverStatus): "confirmed" | "attention" | "critical" | "neutral" {
  if (status === "CONFIRMED_INCLUDED") return "confirmed";
  if (status === "DESCRIBED_NOT_CONFIRMED") return "attention";
  if (status === "EXPLICITLY_NOT_COVERED") return "critical";
  return "neutral";
}

const COVER = [
  {
    name: "Life cover",
    amount: "R2,000,000",
    status: "CONFIRMED_INCLUDED" as CoverStatus,
    detail: "Confirmed on the current policy schedule.",
  },
  {
    name: "Critical illness cover",
    amount: "R750,000",
    status: "CONFIRMED_INCLUDED" as CoverStatus,
    detail: "Confirmed on the current policy schedule.",
  },
  {
    name: "Income protection",
    amount: "—",
    status: "DESCRIBED_NOT_CONFIRMED" as CoverStatus,
    detail: "The wording describes this benefit, but the supplied schedule does not show it as selected.",
  },
  {
    name: "Funeral benefit",
    amount: "—",
    status: "EXPLICITLY_NOT_COVERED" as CoverStatus,
    detail: "The current schedule explicitly records this benefit as not selected.",
  },
];

export function PolicyResultV2() {
  const context = (
    <>
      <section className="rounded-[14px] border border-line bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
          Policy set
        </p>
        <dl className="mt-3 space-y-3">
          <ContextRow label="Status" value="Active" />
          <ContextRow label="Documents used" value="3" />
          <ContextRow label="Reconstruction" value="Partial, safe to explain" />
          <ContextRow label="Policy number" value="POL-48271" />
        </dl>
      </section>

      <section className="rounded-[14px] border border-blue-200 bg-blue-50/70 p-4">
        <div className="flex gap-2.5">
          <Info size={17} className="mt-0.5 shrink-0 text-blue-700" aria-hidden />
          <div>
            <p className="text-[13px] font-semibold text-ink">Synthetic prototype</p>
            <p className="mt-1 text-[12px] leading-5 text-ink-soft">
              This result uses representative demo data to validate the PolicyCheck customer experience.
            </p>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <ResultWorkspace
      productName="PolicyCheck"
      portfolioLabel="Part of Untangle South Africa"
      documentLabel="Life policy set · POL-48271"
      navItems={NAV}
      context={context}
      backTo="/solutions/policycheck"
      backLabel="Back to PolicyCheck"
      statusLabel="Prototype"
      trustNote="PolicyCheck is still behind its release gate. This prototype uses synthetic data only."
    >
      <div className="space-y-10">
        <ResultSection id="summary" title="Your 30-second answer">
          <div className="border-l-4 border-blue-500 bg-blue-50/55 px-4 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-blue-800">
              Current policy position
            </p>
            <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink">
              Life and critical illness cover are confirmed. Income protection is not.
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-ink-soft">
              The supplied schedule confirms two purchased benefits. Income protection appears in the policy wording,
              but the current schedule does not show that you bought it.
            </p>
          </div>

          <div className="mt-5 grid lg:grid-cols-3">
            <KeyMetric label="Premium" value="R1,245 / month" note="Current schedule" />
            <KeyMetric label="Policy status" value="Active" note="Based on supplied current documents" />
            <KeyMetric label="Unconfirmed cover" value="1 benefit" note="Needs clarification before relying on it" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <QuickPoint
              icon={<CheckCircle2 size={17} />}
              title="2 benefits confirmed"
              body="Life and critical illness cover are shown as selected on the schedule."
            />
            <QuickPoint
              icon={<AlertTriangle size={17} />}
              title="1 benefit needs checking"
              body="Income protection is described in wording, but purchase is not confirmed."
            />
            <QuickPoint
              icon={<FileText size={17} />}
              title="3 documents used"
              body="Schedule, policy wording and one related claim decision."
            />
          </div>
        </ResultSection>

        <ResultSection
          id="meaning"
          title="What this means for you"
          intro="PolicyCheck separates what the documents say from what you can safely rely on."
        >
          <div className="space-y-5">
            <MeaningBlock title="Your schedule is the key proof of purchased cover">
              <p>
                The current schedule confirms life cover of R2,000,000 and critical illness cover of R750,000.
                Those are treated as purchased cover because the schedule positively shows them.
              </p>
            </MeaningBlock>

            <MeaningBlock title="Generic wording is not proof that you bought a benefit" tone="attention">
              <p>
                Income protection appears in the policy wording, but it is not shown as selected on the supplied
                schedule. PolicyCheck therefore keeps it as described but unconfirmed instead of assuming you have it.
              </p>
            </MeaningBlock>

            <MeaningBlock title="The claim letter does not rewrite your cover">
              <p>
                A related claim decision is kept separate from the base policy reconstruction. What the insurer says
                in that letter cannot add or remove purchased cover by itself.
              </p>
            </MeaningBlock>
          </div>
        </ResultSection>

        <ResultSection id="money" title="Your money">
          <FactRows
            rows={[
              { label: "Current premium", value: "R1,245.00", note: "Monthly" },
              { label: "Policy fee", value: "R25.00", note: "Shown separately on the schedule" },
              { label: "Premium due date", value: "1st of each month" },
              { label: "Premium escalation", value: "5% annually", note: "As stated in the current schedule" },
            ]}
          />
          <p className="mt-3 text-[12px] leading-5 text-ink-soft">
            PolicyCheck does not calculate an annual premium or other derived amounts unless the validated result provides them.
          </p>
        </ResultSection>

        <ResultSection
          id="cover"
          title="Your cover"
          intro="Cover status is kept explicit so a benefit mentioned in wording cannot quietly become purchased cover."
        >
          <div className="divide-y divide-line/80 border-y border-line/80">
            {COVER.map((item) => (
              <div key={item.name} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_160px_190px] md:items-center">
                <div>
                  <p className="text-[14.5px] font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{item.detail}</p>
                </div>
                <p className="text-[14px] font-semibold text-ink md:text-right">{item.amount}</p>
                <div className="md:text-right">
                  <StatusBadge tone={coverStatusTone(item.status)}>
                    {coverStatusLabel(item.status)}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </ResultSection>

        <ResultSection
          id="limits"
          title="Limits, waiting periods & exclusions"
          intro="These items are shown only where the supplied policy documents safely support them."
        >
          <div className="space-y-5">
            <MeaningBlock title="Critical illness waiting period">
              <p>
                The schedule and wording record a 90-day waiting period for the confirmed critical illness benefit.
              </p>
            </MeaningBlock>
            <MeaningBlock title="Pre-existing condition limitation" tone="attention">
              <p>
                The supplied wording contains a pre-existing-condition limitation. Whether it applies to a real claim
                depends on the actual facts and is not decided here.
              </p>
            </MeaningBlock>
          </div>
        </ResultSection>

        <ResultSection id="conditions" title="Important conditions">
          <div className="divide-y divide-line/80 border-y border-line/80">
            <Condition
              title="Premiums must remain paid"
              body="The policy wording links continued cover to premium payment. PolicyCheck does not infer a missed payment unless the documents show one."
            />
            <Condition
              title="Material information must be disclosed"
              body="The wording contains a disclosure condition. Whether a real disclosure was complete is a factual question outside this result."
            />
          </div>
        </ResultSection>

        <ResultSection
          id="heads-up"
          title="Heads up"
          intro="These are gaps or issues worth clarifying before you rely on the policy position."
        >
          <div className="space-y-4">
            <HeadUp
              title="Income protection is not confirmed as purchased"
              body="Ask for the current schedule or endorsement that shows whether this benefit was selected."
            />
            <HeadUp
              title="A referenced endorsement is missing"
              body="The schedule refers to Endorsement E-14, but that document is not in the supplied set."
            />
            <HeadUp
              title="Claim allegations remain the insurer’s stated position"
              body="The related claim letter states a reason for rejection, but PolicyCheck does not treat that reason as a proven fact."
            />
          </div>
        </ResultSection>

        <ResultSection
          id="claim"
          title="Related claim decision"
          intro="PolicyCheck explains what the insurer says without deciding that the insurer is right or wrong."
        >
          <div className="border-y border-line bg-white">
            <FactRows
              rows={[
                { label: "Decision", value: "Claim rejected" },
                { label: "Insurer’s stated reason", value: "Condition not met", note: "Insurer-stated, not proven" },
                { label: "Clause relied on", value: "Clause 12.4", note: "Matching wording found in the supplied policy wording" },
                { label: "Relevant purchased cover", value: "Critical illness cover", note: "Confirmed on current schedule" },
              ]}
            />
          </div>

          <div className="mt-5 border-l-2 border-blue-400 pl-4">
            <p className="text-[14px] font-semibold text-ink">Approved review guidance</p>
            <p className="mt-1 text-[13.5px] leading-6 text-ink-soft">
              Where the applicable Policyholder Protection Rule safely applies, a rejected or disputed claim notice
              should explain the internal review route and relevant time limits. PolicyCheck does not calculate a
              personal deadline unless the required receipt date is safely known.
            </p>
          </div>
        </ResultSection>

        <ResultSection id="questions" title="Questions for your broker or insurer">
          <ul className="space-y-3">
            {[
              "Please confirm whether income protection is included in my current policy and provide the schedule or endorsement that proves it.",
              "Please provide the missing Endorsement E-14 referred to in the current schedule.",
              "Please identify the exact facts and evidence relied on for the claim decision.",
              "Please explain how I can use the insurer’s internal claim-review process.",
            ].map((question) => (
              <li key={question} className="flex gap-3 border-t border-line/80 pt-3 first:border-t-0 first:pt-0">
                <HelpCircle size={17} className="mt-0.5 shrink-0 text-blue-600" aria-hidden />
                <span className="text-[13.5px] leading-6 text-ink">{question}</span>
              </li>
            ))}
          </ul>
        </ResultSection>

        <ResultSection
          id="evidence"
          title="Documents & evidence"
          intro="Every material finding should stay traceable to the policy document that supports it."
        >
          <EvidenceDisclosure
            source="Current policy schedule"
            location="Page 2"
            excerpt="Life Cover R2,000,000; Critical Illness Cover R750,000; Funeral Benefit — Not selected."
            meaning="This schedule confirms the purchased cover and the explicitly unselected funeral benefit used above."
          />
          <EvidenceDisclosure
            source="Policy wording"
            location="Page 14 · Clause 12.4"
            excerpt="The benefit is subject to the conditions and exclusions set out in this section."
            meaning="This wording can support a clause reference, but it does not by itself prove that every benefit described in the wording was purchased."
          />
          <EvidenceDisclosure
            source="Claim decision"
            location="Page 1"
            excerpt="We have declined the claim because the stated policy condition was not met."
            meaning="This is preserved as the insurer’s stated reason. PolicyCheck does not treat the allegation as a proven fact."
          />
        </ResultSection>

        <ResultSection
          id="ask"
          title="Ask PolicyCheck"
          intro="Follow-up answers will be limited to the reconstructed policy, retained evidence and approved rules."
        >
          <div className="rounded-[14px] border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex gap-3">
              <MessageCircleQuestion size={19} className="mt-0.5 shrink-0 text-blue-700" aria-hidden />
              <div>
                <p className="text-[14px] font-semibold text-ink">Grounded Ask preview</p>
                <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
                  Live PolicyCheck Ask remains off until the genuine-document release gate is complete.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <AskPrompt>Is income protection definitely included in my policy?</AskPrompt>
            <AskPrompt>Why did the insurer say my claim was rejected?</AskPrompt>
            <AskPrompt>Which clause did the insurer rely on?</AskPrompt>
            <AskPrompt>What review route does the approved rule say is available?</AskPrompt>
          </div>
        </ResultSection>

        <div className="border-t border-line pt-6">
          <p className="text-[11.5px] leading-5 text-ink-soft">
            Synthetic PolicyCheck prototype. It explains supplied policy evidence and approved guidance; it does not
            decide whether a claim must be paid, whether a disputed fact is true, or whether a clause is enforceable.
          </p>
        </div>
      </div>
    </ResultWorkspace>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[11.5px] text-ink-soft">{label}</dt>
      <dd className="text-right text-[12px] font-semibold text-ink">{value}</dd>
    </div>
  );
}

function QuickPoint({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="border border-line bg-white p-4">
      <span className="text-blue-600" aria-hidden>
        {icon}
      </span>
      <p className="mt-3 text-[13.5px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">{body}</p>
    </div>
  );
}

function Condition({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-4">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] leading-5 text-ink-soft">{body}</p>
    </div>
  );
}

function HeadUp({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-4 border-stamp-amber bg-amber-50/70 px-4 py-4">
      <div className="flex gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
        <div>
          <p className="text-[14px] font-semibold text-ink">{title}</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">{body}</p>
        </div>
      </div>
    </div>
  );
}
