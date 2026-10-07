import { useState } from "react";
import { workDemos } from "@/lib/workcheck-demo";
import {
  BulletList,
  EvidenceDisclosure,
  FactRows,
  MeaningBlock,
  ResultSection,
} from "./ResultPrimitives";
import { ResultWorkspace } from "./ResultWorkspace";

const navItems = [
  { id: "summary", label: "Summary" },
  { id: "facts", label: "Document facts" },
  { id: "meaning", label: "What this means" },
  { id: "heads-up", label: "Heads up" },
  { id: "questions", label: "Questions to ask" },
  { id: "evidence", label: "Evidence" },
];

export function WorkResultV2() {
  const [selected, setSelected] = useState("agreement");
  const demo = workDemos.find((item) => item.id === selected) ?? workDemos[0]!;
  return (
    <ResultWorkspace
      productName="WorkCheck"
      portfolioLabel="by Untangle South Africa"
      documentLabel={demo.document}
      navItems={navItems}
      statusLabel="Synthetic demo"
      trustNote="Synthetic documents only. This report explains document wording; it does not decide your legal rights."
      context={
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-sm font-semibold">Document picture</h2>
          <FactRows
            rows={[
              { label: "Document role", value: demo.role },
              { label: "Process stage", value: demo.stage },
              { label: "Jurisdiction", value: "South Africa (demo)" },
              { label: "Documents supplied", value: "One synthetic document" },
            ]}
          />
        </section>
      }
    >
      <div className="mb-7">
        <label htmlFor="work-demo" className="block text-sm font-semibold">
          Choose a demo document
        </label>
        <select
          id="work-demo"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="mt-2 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm"
        >
          {workDemos.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-5 text-ink-soft">
          No upload or live analysis. All names, amounts, dates and source excerpts are invented for
          this demo.
        </p>
      </div>
      <div key={demo.id} className="space-y-8">
        <ResultSection id="summary" title="Your document in plain English" intro={demo.summary}>
          <p className="text-sm leading-6 text-ink-soft">
            {demo.role} · {demo.stage}
          </p>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Untangle explains what is written and what is missing. It does not decide whether a term
            is lawful, a dismissal is fair or a referral is in time.
          </p>
        </ResultSection>
        <ResultSection id="facts" title="Important document facts">
          <FactRows rows={demo.facts} />
        </ResultSection>
        <ResultSection
          id="meaning"
          title="What this means for you"
          intro="Start with the document wording, then check the points that need clarification."
        >
          <div className="space-y-5">
            {demo.points.map((point) => (
              <details key={point.title} className="rounded-xl border border-line p-4">
                <summary className="min-h-11 cursor-pointer text-sm font-semibold">
                  {point.title}
                </summary>
                <div className="mt-3 space-y-4">
                  <MeaningBlock title="What the document says">
                    <p>{point.says}</p>
                    <a
                      className="font-semibold text-teal underline"
                      href={"#source-" + point.source}
                    >
                      See source
                    </a>
                  </MeaningBlock>
                  <MeaningBlock title="What that means">
                    <p>{point.means}</p>
                  </MeaningBlock>
                  <MeaningBlock title="What you may want to check">
                    <p>{point.check}</p>
                  </MeaningBlock>
                </div>
              </details>
            ))}
          </div>
        </ResultSection>
        <ResultSection
          id="heads-up"
          title="Heads up"
          intro="These gaps limit what this document can tell us."
        >
          <BulletList
            items={demo.missing.map((detail, index) => ({ title: "Point " + (index + 1), detail }))}
          />
        </ResultSection>
        <ResultSection id="questions" title="Questions you could ask" disclosure>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-ink-soft">
            {demo.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-ink-soft">
            These are conversation prompts, not messages sent by Untangle. Live Ask/Q&A is deferred.
          </p>
        </ResultSection>
        <ResultSection
          id="evidence"
          title="Evidence from the demo document"
          intro="Open an excerpt to see the wording behind the explanation. These are synthetic sources."
        >
          {demo.evidence.map((source) => (
            <div key={source.id} id={"source-" + source.id} className="scroll-mt-28">
              <EvidenceDisclosure
                source={demo.document}
                location={source.location}
                excerpt={source.excerpt}
                meaning={source.meaning}
                sourceLabel="What the document says"
              />
            </div>
          ))}
        </ResultSection>
      </div>
    </ResultWorkspace>
  );
}
