/** Synthetic presentation fixtures, not a backend extraction contract or legal rules. */
export type WorkDemo = {
  id: string;
  label: string;
  document: string;
  role: string;
  stage: string;
  summary: string;
  facts: Array<{ label: string; value: string; note?: string }>;
  points: Array<{ title: string; says: string; means: string; check: string; source: string }>;
  missing: string[];
  questions: string[];
  evidence: Array<{ id: string; location: string; excerpt: string; meaning: string }>;
};

export const workDemos: WorkDemo[] = [
  {
    id: "agreement",
    label: "Employment agreement",
    document: "Demo employment agreement.pdf",
    role: "Employment contract",
    stage: "Before starting work",
    summary:
      "This agreement sets out a permanent role, monthly pay and working hours. It refers to a separate workplace policy that is missing from this demo document set.",
    facts: [
      { label: "Employer", value: "Demo Services SA" },
      { label: "Role", value: "Office administrator" },
      { label: "Employment type", value: "Permanent" },
      { label: "Start date", value: "1 November 2026", note: "Agreement, clause 1" },
      {
        label: "Monthly pay",
        value: "R18,500 gross",
        note: "Before deductions; take-home pay is not stated. Clause 3.",
      },
      {
        label: "Working hours",
        value: "Monday–Friday, 08:00–17:00",
        note: "One-hour unpaid lunch break. Clause 4.",
      },
    ],
    points: [
      {
        title: "Pay and deductions",
        says: "The agreement states gross monthly pay of R18,500 and payment on the last working day of the month.",
        means:
          "The amount is before deductions. The supplied agreement does not state your take-home pay.",
        check: "Ask for a breakdown of deductions and any benefits that affect your payslip.",
        source: "pay",
      },
      {
        title: "Overtime",
        says: "Overtime must be agreed in advance. Payment or time off is described in a separate workplace policy.",
        means: "The agreement alone does not explain the overtime arrangement in full.",
        check:
          "Ask for the referenced policy and an explanation of how overtime is recorded and paid or exchanged for time off.",
        source: "hours",
      },
      {
        title: "Probation and notice",
        says: "The agreement states three months of probation and four weeks of written notice.",
        means:
          "These are the terms recorded in the document. They do not establish whether a future employment decision is fair or lawful.",
        check: "Ask how probation reviews work and how written notice should be delivered.",
        source: "notice",
      },
    ],
    missing: [
      "The workplace policy referred to in clause 4 was not supplied.",
      "Take-home pay and a full deduction breakdown are not stated.",
      "No bargaining council or sector instrument is identified in the supplied agreement.",
    ],
    questions: [
      "Could you send me the workplace policy referenced in clause 4?",
      "What deductions and benefits will appear on my payslip?",
      "How will my probation reviews be arranged and recorded?",
    ],
    evidence: [
      {
        id: "role",
        location: "Page 1 · heading and clause 1",
        excerpt:
          "Demo Services SA — South Africa. You are appointed as an office administrator on a permanent basis from 1 November 2026.",
        meaning: "The employer, role, employment type and start date are stated in the agreement.",
      },
      {
        id: "pay",
        location: "Page 2 · clause 3",
        excerpt:
          "Gross remuneration is R18,500 per month, payable on the last working day of each month.",
        meaning: "This states gross pay and payment timing, not take-home pay.",
      },
      {
        id: "hours",
        location: "Page 2 · clause 4",
        excerpt:
          "Hours are Monday to Friday, 08:00 to 17:00 with a one-hour unpaid lunch break. Overtime must be agreed in advance. Payment or time off is governed by the workplace policy.",
        meaning: "The referenced policy is needed to understand the overtime arrangement.",
      },
      {
        id: "notice",
        location: "Page 3 · clauses 6–7",
        excerpt: "Probation is three months. Either party must give four weeks of written notice.",
        meaning: "These are document terms; no legal assessment has been made.",
      },
    ],
  },
  {
    id: "hearing",
    label: "Hearing notice",
    document: "Demo hearing notice.pdf",
    role: "Disciplinary hearing notice",
    stage: "Hearing scheduled; no outcome supplied",
    summary:
      "This notice asks the employee to attend a hearing about an alleged failure to follow a reporting procedure. It records an allegation, not a finding that misconduct occurred.",
    facts: [
      { label: "Employer", value: "Demo Services SA" },
      { label: "Notice date", value: "5 October 2026", note: "Page 1 · heading" },
      {
        label: "Hearing",
        value: "14 October 2026 at 10:00",
        note: "Copied from the notice, not calculated. Paragraph 2.",
      },
      { label: "Location", value: "Meeting room 2", note: "Paragraph 2" },
      {
        label: "Representation wording",
        value: "A fellow employee may assist",
        note: "As stated in paragraph 3; no broader entitlement is assessed.",
      },
      { label: "Outcome", value: "Not supplied" },
    ],
    points: [
      {
        title: "The allegation",
        says: "The employer alleges that the employee did not follow the absence-reporting procedure on 28 September 2026.",
        means:
          "This is the employer’s allegation. The notice does not establish what happened or whether it amounts to misconduct.",
        check: "Ask for the procedure and the records the employer will refer to.",
        source: "allegation",
      },
      {
        title: "What the notice asks you to do",
        says: "Attend at 10:00 on 14 October 2026 in meeting room 2. The notice says a fellow employee may assist.",
        means:
          "These are the arrangements stated in this notice. Any change needs confirmation from the employer.",
        check:
          "Confirm the arrangements and ask how to arrange assistance or raise an attendance difficulty.",
        source: "hearing",
      },
      {
        title: "What happens next",
        says: "No hearing outcome, appeal process or referral period is included in the supplied notice.",
        means: "This document does not tell us the outcome or establish a dispute deadline.",
        check:
          "Ask how the outcome and any internal review process will be communicated. If you need advice on your rights or time limits, speak to a qualified labour professional or the relevant forum.",
        source: "hearing",
      },
    ],
    missing: [
      "The absence-reporting procedure and supporting records were not supplied.",
      "No hearing outcome has been supplied.",
      "No internal appeal or external referral period is stated; no deadline has been calculated.",
    ],
    questions: [
      "Please share the procedure and records referred to in the allegation.",
      "How do I arrange assistance and confirm attendance?",
      "How will I receive the outcome and information about any internal review process?",
    ],
    evidence: [
      {
        id: "notice-heading",
        location: "Page 1 · heading",
        excerpt:
          "Demo Services SA — South Africa. Disciplinary hearing notice. Issued 5 October 2026.",
        meaning: "This identifies the employer, document role and notice date.",
      },
      {
        id: "allegation",
        location: "Page 1 · paragraph 1",
        excerpt:
          "It is alleged that you failed to follow the absence-reporting procedure on 28 September 2026.",
        meaning: "The notice contains an allegation, not a proven finding.",
      },
      {
        id: "hearing",
        location: "Page 1 · paragraphs 2–3",
        excerpt:
          "Please attend a disciplinary hearing on 14 October 2026 at 10:00 in meeting room 2. A fellow employee may assist you.",
        meaning: "The date, time, place and assistance wording come directly from the notice.",
      },
    ],
  },
];
