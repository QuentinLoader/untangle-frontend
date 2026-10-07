import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, FileText, MessageSquare, ShieldCheck, WalletCards } from "lucide-react";
import { withAuth } from "@/auth/ProtectedRoute";
import {
  BulletList,
  EvidenceDisclosure,
  FactRows,
  KeyMetric,
  MeaningBlock,
  ResultSection,
  StatusBadge,
} from "@/components/untangle/v2/ResultPrimitives";
import { type WorkspaceNavItem } from "@/components/untangle/v2/ResultWorkspace";
import { PrototypeWorkspace } from "@/components/untangle/v2/PrototypeWorkspace";

export const Route = createFileRoute("/prototype/leasecheck-v2")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "LeaseCheck V2 prototype — Untangle South Africa" },
      {
        name: "description",
        content: "Authenticated design prototype for the next LeaseCheck result experience.",
      },
    ],
  }),
  component: withAuth(LeaseCheckV2Prototype),
});

const NAV_ITEMS: WorkspaceNavItem[] = [
  { id: "summary", label: "Summary" },
  { id: "meaning", label: "What this means" },
  { id: "money", label: "Money" },
  { id: "responsibilities", label: "Responsibilities" },
  { id: "clauses", label: "Important clauses" },
  { id: "ending", label: "Ending the agreement" },
  { id: "problems", label: "If things go wrong" },
  { id: "protections", label: "Legal protections" },
  { id: "evidence", label: "Evidence" },
  { id: "ask", label: "Ask" },
];

const KEY_POINTS = [
  {
    title: "A large amount is still due at the end",
    detail:
      "Your monthly payments do not clear the full agreement. You will need a plan for the final balloon payment.",
  },
  {
    title: "Ending early can still cost you money",
    detail:
      "Returning the vehicle or asking to settle early does not automatically mean the agreement ends with nothing further to pay.",
  },
  {
    title: "Missed payments can become expensive",
    detail:
      "The agreement allows additional charges and enforcement steps if payments are not kept up to date.",
  },
];

const MONEY_ROWS = [
  { label: "Monthly payment", value: "R9,649.47" },
  { label: "Agreement term", value: "72 months" },
  { label: "Initiation fee", value: "R1,207.50", note: "Shown separately in the agreement." },
  { label: "Monthly service fee", value: "R69.00", note: "Included as an agreement fee." },
  { label: "Final balloon / residual", value: "R147,475.00" },
  { label: "Total amount repayable", value: "R842,236.84" },
];

const YOUR_RESPONSIBILITIES = [
  {
    title: "Pay on time",
    detail: "Keep the agreed monthly instalments up to date for the full term.",
  },
  {
    title: "Keep the vehicle insured",
    detail: "Maintain the insurance required by the agreement while finance remains outstanding.",
  },
  {
    title: "Look after the vehicle",
    detail: "Maintain the vehicle and avoid conduct that could materially reduce its value.",
  },
];

const OTHER_PARTY_RESPONSIBILITIES = [
  {
    title: "Apply the agreement as written",
    detail:
      "The credit provider must administer the agreement according to its recorded terms and applicable law.",
  },
  {
    title: "Provide settlement information",
    detail:
      "If you request an early settlement amount, the provider must give you the relevant settlement figure and process.",
  },
];

function ContextRail() {
  return (
    <>
      <div className="rounded-[14px] border border-line bg-white p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              Document
            </p>
            <p className="mt-1 text-[14px] font-semibold text-ink">Vehicle finance agreement</p>
            <p className="mt-1 font-mono text-[11px] leading-5 text-ink-soft">DEMO-VEH-2026-001</p>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-amber-900">
              Check this
            </p>
            <p className="mt-1 text-[13.5px] font-semibold leading-6 text-ink">
              Needs attention: the final balloon is material.
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
              Make sure you know how you plan to pay or refinance it before signing.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-line bg-white p-4">
        <div className="flex items-start gap-3">
          <MessageSquare size={18} className="mt-0.5 shrink-0 text-teal" aria-hidden />
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              Ask LeaseCheck
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-ink-soft">
              Demo prompts are available below. Live answers are not connected in this prototype.
            </p>
            <a href="#ask" className="mt-3 flex items-center text-[14px] font-semibold text-teal">
              See Ask prompts
            </a>
          </div>
        </div>
      </div>
      <div className="rounded-[14px] border border-line bg-white p-4">
        <p className="text-[14px] font-semibold">Where did this come from?</p>
        <p className="mt-2 text-[14px] leading-6 text-ink-soft">
          Synthetic agreement wording · Page 3, financial schedule.
        </p>
        <a href="#evidence" className="mt-3 flex items-center text-[14px] font-semibold text-teal">
          View document evidence
        </a>
      </div>
    </>
  );
}

function LeaseCheckV2Prototype() {
  return (
    <PrototypeWorkspace navItems={NAV_ITEMS} context={<ContextRail />}>
      <div className="space-y-10">
        <ResultSection id="summary" title="Here’s what this agreement means for you">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge>Vehicle finance agreement</StatusBadge>
            <StatusBadge tone="attention">3 things to understand before signing</StatusBadge>
          </div>

          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-ink-soft">
            You are committing to a long-term payment plan with a substantial final balloon payment.
            The monthly instalment is only one part of the total financial commitment.
          </p>

          <div className="v2-key-metrics mt-6 border-y border-line">
            <KeyMetric label="Monthly payment" value="R9,649.47" />
            <KeyMetric label="Term" value="72 months" />
            <KeyMetric label="Total repayable" value="R842,236.84" />
            <KeyMetric label="Final balloon" value="R147,475.00" note="Still due at the end." />
          </div>

          <div className="mt-7">
            <h3 className="text-[16px] font-semibold text-ink">
              Before you sign, understand these three points
            </h3>
            <div className="mt-4">
              <BulletList items={KEY_POINTS} />
            </div>
          </div>

          <a
            href="#meaning"
            className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-teal px-5 text-[14.5px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            See what this means for me
          </a>
        </ResultSection>

        <ResultSection
          id="meaning"
          title="What this means for you"
          intro="These explanations focus on the practical effect of the agreement, not just the wording."
        >
          <div className="space-y-6">
            <MeaningBlock title="Your real payment commitment">
              <p>
                Your monthly payment is a recurring commitment, but it does not fully settle the
                agreement. Plan for the ongoing payments and the final amount separately.
              </p>
            </MeaningBlock>

            <MeaningBlock title="The balloon payment matters" tone="attention">
              <p>
                The final balloon remains due after the monthly instalments. You should understand
                now whether you expect to pay it from savings, refinance it or use another
                arrangement.
              </p>
            </MeaningBlock>

            <MeaningBlock title="Ending early is not the same as walking away">
              <p>
                If you want to settle or end the agreement before the full term, the amount still
                owing and the agreement’s early-termination process remain important.
              </p>
            </MeaningBlock>

            <MeaningBlock title="Missing payments changes the situation">
              <p>
                Missed instalments can trigger extra cost and enforcement steps. The agreement
                should be read together with the formal notices and legal process that apply before
                enforcement can proceed.
              </p>
            </MeaningBlock>
          </div>
        </ResultSection>

        <ResultSection
          id="money"
          title="Money"
          intro="The fixed financial schedule adds the agreement fees to the headline amounts shown above."
        >
          <div className="flex items-center gap-2 pb-4">
            <WalletCards size={18} className="text-teal" aria-hidden />
            <p className="text-[13px] font-medium text-ink-soft">
              Fixed presentation fixtures; fees and totals have not been recalculated.
            </p>
          </div>
          <FactRows rows={MONEY_ROWS} />
        </ResultSection>

        <ResultSection id="responsibilities" title="Responsibilities">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">You</h3>
              <div className="mt-4">
                <BulletList items={YOUR_RESPONSIBILITIES} />
              </div>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Credit provider</h3>
              <div className="mt-4">
                <BulletList items={OTHER_PARTY_RESPONSIBILITIES} />
              </div>
            </div>
          </div>
        </ResultSection>

        <ResultSection
          id="clauses"
          title="Important clauses"
          intro="These are the terms most likely to affect your decision or cost."
        >
          <div className="space-y-6">
            <MeaningBlock title="Balloon / residual">
              <p>
                The agreement records a large final amount after the scheduled monthly payments.
                That amount should be treated as part of the commitment from day one.
              </p>
            </MeaningBlock>
            <MeaningBlock title="Insurance requirement">
              <p>
                The agreement requires appropriate insurance while finance remains outstanding.
                Losing required cover could create a separate problem even if your instalments are
                up to date.
              </p>
            </MeaningBlock>
            <MeaningBlock title="Early settlement">
              <p>
                Early settlement uses the provider’s settlement process. The final amount can differ
                from simply adding the remaining monthly instalments together.
              </p>
            </MeaningBlock>
          </div>
        </ResultSection>

        <ResultSection id="ending" title="Ending the agreement">
          <p className="text-[14.5px] leading-7 text-ink-soft">
            The agreement can end in different ways. Paying the final scheduled amounts, settling
            early, voluntary surrender or enforcement do not have the same financial result.
          </p>
          <div className="mt-5">
            <FactRows
              rows={[
                { label: "Normal end", value: "Term completed and final amount settled" },
                { label: "Early settlement", value: "Settlement amount requested and paid" },
                {
                  label: "Voluntary return",
                  value: "Does not automatically mean nothing further is owed",
                },
              ]}
            />
          </div>
        </ResultSection>

        <ResultSection id="problems" title="If things go wrong">
          <div className="rounded-[14px] border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-stamp-amber" aria-hidden />
              <div>
                <h3 className="text-[15px] font-semibold text-ink">
                  Do not ignore missed-payment notices
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-ink-soft">
                  If you fall behind, the formal notice and enforcement process matters. The next
                  step depends on what the provider has sent and what stage the account has reached.
                </p>
              </div>
            </div>
          </div>
        </ResultSection>

        <ResultSection
          id="protections"
          title="Legal protections"
          intro="Untangle keeps the document facts separate from legal or regulatory guidance."
        >
          <div className="flex items-start gap-3 rounded-[14px] border border-line bg-paper px-4 py-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-teal" aria-hidden />
            <div>
              <p className="text-[14.5px] font-semibold text-ink">
                Legal / rule context · Not confirmed in this demo
              </p>
              <p className="mt-2 text-[14px] leading-6 text-ink-soft">
                No checked legal guidance is supplied with this synthetic agreement. This section is
                intentionally separate from the sample document wording and its plain-language
                meaning.
              </p>
            </div>
          </div>
        </ResultSection>

        <ResultSection
          id="evidence"
          title="Evidence"
          intro="Use this section when you want to see exactly where an important result came from."
        >
          <div className="divide-y divide-line">
            <EvidenceDisclosure
              source="Synthetic vehicle finance agreement"
              location="Page 3 · Financial schedule"
              excerpt="A final balloon amount of R147,475.00 is payable at the end of the agreement term."
              meaning="The monthly instalments do not clear the full balance. A significant final amount remains."
            />
            <EvidenceDisclosure
              source="Synthetic vehicle finance agreement"
              location="Page 5 · Insurance"
              excerpt="The consumer must maintain comprehensive insurance for the duration of the agreement."
              meaning="Insurance is an ongoing responsibility while the agreement remains in force."
            />
            <EvidenceDisclosure
              source="Synthetic vehicle finance agreement"
              location="Page 7 · Default"
              excerpt="Failure to make payment may result in default and enforcement in accordance with applicable law."
              meaning="Missing payments can trigger formal default steps; enforcement is not just an informal collection process."
            />
          </div>
        </ResultSection>

        <ResultSection
          id="ask"
          title="Ask LeaseCheck about this agreement"
          intro="Demo design state: these starter prompts do not submit questions or contact the live Ask service."
        >
          <div className="rounded-[16px] border border-line bg-paper p-4">
            <div className="grid gap-2">
              <div className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink">
                What happens if I settle early?
              </div>
              <div className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink">
                Explain the balloon payment simply.
              </div>
              <div className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink">
                What am I responsible for if the vehicle is damaged?
              </div>
            </div>
            <p className="mt-4 text-[12.5px] leading-5 text-ink-soft">
              Prototype only — these prompts are intentionally not connected to the live Ask
              endpoint.
            </p>
          </div>
        </ResultSection>
      </div>
    </PrototypeWorkspace>
  );
}
