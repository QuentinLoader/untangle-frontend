/**
 * Customer-facing Untangle solution catalogue.
 *
 * Keep product copy, ordering and availability in one place so Home and each
 * solution page always describe the same suite. Coming-soon solutions do not
 * call a backend and only TaxSnap currently maps to a live document module.
 */
import type { DocumentModule } from "./documents";

export type SolutionStatus = "AVAILABLE" | "COMING_SOON";

export type Solution = {
  slug: string;
  name: string;
  tagline: string;
  headline: string;
  shortDescription: string;
  status: SolutionStatus;
  operational: boolean;
  icon: string;
  tint: string;
  moduleKey: DocumentModule | null;
  tags: string[];
  helps: string[];
  documentExamples: string[];
  groundedIn: string[];
  scopeNote?: string;
};

export const SOLUTIONS: Solution[] = [
  {
    slug: "taxsnap",
    name: "TaxSnap",
    tagline: "Tax letters & notices",
    headline: "Understand a tax letter",
    shortDescription:
      "Upload a South African tax letter or notice. TaxSnap explains what it means, what is required, where to act and by when.",
    status: "AVAILABLE",
    operational: true,
    icon: "📨",
    tint: "var(--tint-red)",
    moduleKey: "TAX",
    tags: ["Tax letters", "Tax notices", "What to do next"],
    helps: [
      "Understand what the letter or notice is about in plain English.",
      "See what is being asked of you and which action matters next.",
      "Find where or how to respond when that can be confirmed.",
      "See important dates, deadlines, amounts, rights and consequences when relevant.",
      "Know where to look when the letter refers to earlier correspondence or missing instructions.",
    ],
    documentExamples: [
      "SARS verification and supporting-document letters",
      "Assessments, penalties and payment-related notices",
      "Objection, appeal and correction correspondence",
      "Customs and other SARS notices",
      "Other South African tax-related letters and notices",
    ],
    groundedIn: ["SARS published guidance", "Applicable South African tax and customs processes"],
  },
  {
    slug: "leasecheck",
    name: "LeaseCheck",
    tagline: "Residential leases",
    headline: "Understand your residential lease",
    shortDescription:
      "See the important terms, costs and responsibilities before signing — or understand your options when there is a dispute.",
    status: "COMING_SOON",
    operational: false,
    icon: "🏠",
    tint: "var(--teal-dim)",
    moduleKey: null,
    tags: ["Deposits", "Rent increases", "Maintenance"],
    helps: [
      "Understand deposits, rent, escalation clauses and notice periods.",
      "See who is responsible for maintenance and repairs.",
      "Highlight terms that may need closer attention before signing.",
      "Explain practical recourse when a residential lease dispute arises.",
    ],
    documentExamples: ["Residential lease agreements", "Lease amendments", "Residential lease-related notices"],
    groundedIn: ["Rental Housing Act", "Consumer Protection Act where applicable"],
  },
  {
    slug: "workcheck",
    name: "WorkCheck",
    tagline: "Employment documents",
    headline: "Understand an employment document",
    shortDescription:
      "Make sense of contracts, disciplinary notices and dismissal letters, including important steps and deadlines that may apply.",
    status: "COMING_SOON",
    operational: false,
    icon: "💼",
    tint: "var(--tint-blue)",
    moduleKey: null,
    tags: ["Contracts", "Discipline", "Dismissal"],
    helps: [
      "Understand important employment-contract terms and minimum standards.",
      "Explain what a disciplinary notice is asking you to do and what happens next.",
      "Understand the reason and process recorded in a dismissal letter.",
      "Highlight when a matter may need CCMA attention and an important referral deadline may apply.",
    ],
    documentExamples: ["Employment contracts", "Disciplinary notices", "Dismissal or termination letters"],
    groundedIn: ["Basic Conditions of Employment Act", "Labour Relations Act", "CCMA rules"],
  },
  {
    slug: "debtcheck",
    name: "DebtCheck",
    tagline: "Debt letters & notices",
    headline: "Understand a debt demand or notice",
    shortDescription:
      "Find out what the creditor or collector is asking for, what needs checking and what your practical options are.",
    status: "COMING_SOON",
    operational: false,
    icon: "🧾",
    tint: "var(--tint-sand)",
    moduleKey: null,
    tags: ["Demand letters", "Debt collectors", "Debt review"],
    helps: [
      "Explain what a demand, collector letter or debt-review document means.",
      "Highlight dates and facts needed to assess whether prescription may be relevant.",
      "Flag interest or balance issues that may need an in-duplum check.",
      "Explain whether the document shows the next collection or court step and what to do next.",
    ],
    documentExamples: ["Letters of demand", "Debt collector correspondence", "EAO/garnishee notices", "Debt-review correspondence"],
    groundedIn: ["National Credit Act", "Prescription Act", "Applicable debt-collection procedure"],
  },
  {
    slug: "policycheck",
    name: "PolicyCheck",
    tagline: "Insurance policies & claims",
    headline: "Understand your insurance policy or claim decision",
    shortDescription:
      "See what your policy actually covers and excludes — or understand why a claim was rejected and what you can do next.",
    status: "COMING_SOON",
    operational: false,
    icon: "🛡️",
    tint: "var(--paper-2)",
    moduleKey: null,
    tags: ["Cover", "Exclusions", "Claim rejection"],
    helps: [
      "Explain cover, exclusions, waiting periods, excesses and important conditions.",
      "Surface fees or exit terms that matter to the decision.",
      "Explain the reason given for a claim rejection or repudiation.",
      "Show the escalation or ombudsman route when the document and rules support it.",
    ],
    documentExamples: ["Insurance policy wording", "Policy schedules", "Claim rejection or repudiation letters"],
    groundedIn: ["Policy wording", "FAIS framework", "Insurance conduct standards", "Relevant ombudsman rules"],
    scopeNote: "Initial release focus: insurance policies and insurance claim decisions. Retirement and investment product documents can follow later.",
  },
  {
    slug: "aartocheck",
    name: "AARTOCheck",
    tagline: "Traffic infringement notices",
    headline: "Understand a traffic infringement notice",
    shortDescription:
      "See what the notice means, what action it requires and the options and demerit-point consequences shown for the infringement.",
    status: "COMING_SOON",
    operational: false,
    icon: "🚦",
    tint: "var(--tint-red)",
    moduleKey: null,
    tags: ["Notices", "Disputes", "Demerit points"],
    helps: [
      "Explain the infringement notice in plain English.",
      "Show what the notice says you can do next, including payment or representation options where applicable.",
      "Highlight procedural details that may need checking.",
      "Explain any demerit-point consequence supported by the notice and applicable AARTO rules.",
    ],
    documentExamples: ["AARTO infringement notices", "AARTO-related notices and correspondence"],
    groundedIn: ["AARTO Act and applicable regulations/processes"],
  },
];

export function findSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}

export function solutionStatusLabel(status: SolutionStatus): string {
  return status === "AVAILABLE" ? "Available" : "Coming soon";
}
