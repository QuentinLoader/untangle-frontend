/**
 * PRODUCT METADATA ONLY.
 *
 * This catalogue describes what Untangle offers as a product. It never contains
 * customer data and coming-soon entries never call a backend. `moduleKey` is only
 * set for solutions the backend genuinely supports today.
 */
import type { DocumentModule } from "./documents";

export type SolutionStatus = "AVAILABLE" | "COMING_SOON";

export type Solution = {
  slug: string;
  name: string;
  tagline: string;
  purpose: string;
  status: SolutionStatus;
  operational: boolean;
  icon: string;
  tint: string;
  /** Only set when the backend already detects this module. Never invented. */
  moduleKey: DocumentModule | null;
  helps: string[];
};

export const SOLUTIONS: Solution[] = [
  {
    slug: "taxsnap",
    name: "TaxSnap",
    tagline: "SARS documents",
    purpose: "Understand SARS letters, notices and tax correspondence.",
    status: "AVAILABLE",
    operational: true,
    icon: "📨",
    tint: "var(--tint-red)",
    moduleKey: "TAX",
    helps: [
      "what SARS is asking for",
      "important dates",
      "amounts",
      "actions you may need to take",
      "risks",
      "rights or options contained in the document",
    ],
  },
  {
    slug: "leasecheck",
    name: "LeaseCheck",
    tagline: "Lease documents",
    purpose: "Understand residential leases, obligations, notice periods and important clauses.",
    status: "COMING_SOON",
    operational: false,
    icon: "🏠",
    tint: "var(--teal-dim)",
    moduleKey: null,
    helps: [
      "rent and deposits",
      "escalation clauses",
      "notice periods",
      "obligations",
      "important dates",
    ],
  },
  {
    slug: "dealcheck",
    name: "DealCheck",
    tagline: "Property deals",
    purpose: "Understand property offers, sale agreements and important deal terms.",
    status: "COMING_SOON",
    operational: false,
    icon: "🤝",
    tint: "var(--tint-sand)",
    moduleKey: null,
    helps: [
      "offer and purchase price terms",
      "suspensive conditions",
      "occupation and transfer dates",
      "costs and commissions",
      "obligations on each party",
    ],
  },
  {
    slug: "workcheck",
    name: "WorkCheck",
    tagline: "Work documents",
    purpose: "Understand employment and workplace documents.",
    status: "COMING_SOON",
    operational: false,
    icon: "💼",
    tint: "var(--tint-blue)",
    moduleKey: null,
    helps: [
      "pay and benefits",
      "notice and probation periods",
      "restraint or confidentiality clauses",
      "leave entitlements",
      "important dates",
    ],
  },
  {
    slug: "contactvalidate",
    name: "ContactValidate",
    tagline: "Contact checks",
    purpose: "Check that contact details on a document look complete and consistent.",
    status: "COMING_SOON",
    operational: false,
    icon: "📇",
    tint: "var(--paper-2)",
    moduleKey: null,
    helps: [
      "contact names and roles",
      "email addresses and phone numbers",
      "reference numbers",
      "where to send a response",
    ],
  },
];

export function findSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}

export function solutionStatusLabel(status: SolutionStatus): string {
  return status === "AVAILABLE" ? "Available" : "Coming soon";
}
