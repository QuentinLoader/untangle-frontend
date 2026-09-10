/**
 * Customer-facing Untangle product catalogue — single source of truth.
 *
 * Every screen (Home, product detail, Upload, Documents, Results, Landing)
 * reads product name, description, icon, availability and copy from here.
 * Adding a future product should mean adding one entry below plus its backend
 * module + result adapter — never re-laying-out Home or navigation.
 */
import { Briefcase, FileText, Home, Receipt, ShieldCheck, type LucideIcon } from "lucide-react";
import type { DocumentModule } from "./documents";

const LEASECHECK_AVAILABLE = import.meta.env["VITE_LEASECHECK_AVAILABLE"] === "true";

export type SolutionStatus = "AVAILABLE" | "COMING_SOON";

/** A tab in the shared mobile results shell. */
export type ResultSection = { id: string; label: string; available?: boolean };

export type Solution = {
  slug: string;
  /** Display order in every product list. */
  order: number;
  name: string;
  /** One line, used on Home rows and product headers. */
  shortDescription: string;
  /** Longer positioning copy for the product detail screen. */
  description: string;
  status: SolutionStatus;
  /** True only when the backend module can actually analyse the document. */
  operational: boolean;
  icon: LucideIcon;
  /** Subtle surface tint used behind the icon. */
  tint: string;
  moduleKey: DocumentModule | null;
  /** Product-specific upload copy. */
  uploadTitle: string;
  uploadHint: string;
  helps: string[];
  documentExamples: string[];
  groundedIn: string[];
  /** Section labels for the shared results shell. */
  resultSections: ResultSection[];
  scopeNote?: string;
};

const TAX_SECTIONS: ResultSection[] = [
  { id: "overview", label: "Overview" },
  { id: "actions", label: "Actions" },
  { id: "dates", label: "Dates" },
  { id: "ask", label: "Ask", available: false },
];

const LEASE_SECTIONS: ResultSection[] = [
  { id: "overview", label: "Overview" },
  { id: "terms", label: "Key terms" },
  { id: "risks", label: "Risks" },
  { id: "ask", label: "Ask", available: false },
];

export const SOLUTIONS: Solution[] = [
  {
    slug: "taxsnap",
    order: 1,
    name: "TaxSnap",
    shortDescription: "SARS and other South African tax letters",
    description:
      "Upload a South African tax letter or notice. TaxSnap explains what it means, what is required, where to act and by when.",
    status: "AVAILABLE",
    operational: true,
    icon: Receipt,
    tint: "var(--tint-red)",
    moduleKey: "TAX",
    uploadTitle: "Upload your tax letter",
    uploadHint: "A SARS letter, assessment, penalty or other tax notice.",
    helps: [
      "Understand what the letter or notice is about in plain English.",
      "See what is being asked of you and which action matters next.",
      "Find where or how to respond when that can be confirmed.",
      "See important dates, deadlines, amounts, rights and consequences when relevant.",
    ],
    documentExamples: [
      "SARS verification and supporting-document letters",
      "Assessments, penalties and payment-related notices",
      "Objection, appeal and correction correspondence",
      "Customs and other SARS notices",
    ],
    groundedIn: ["SARS published guidance", "South African tax and customs processes"],
    resultSections: TAX_SECTIONS,
  },
  {
    slug: "leasecheck",
    order: 2,
    name: "LeaseCheck",
    shortDescription: "Residential lease agreements",
    description:
      "See the important terms, costs and responsibilities before signing — or understand your options when there is a dispute.",
    status: LEASECHECK_AVAILABLE ? "AVAILABLE" : "COMING_SOON",
    operational: LEASECHECK_AVAILABLE,
    icon: Home,
    tint: "var(--teal-dim)",
    moduleKey: LEASECHECK_AVAILABLE ? "LEASE" : null,
    uploadTitle: "Upload your residential lease",
    uploadHint: "A lease agreement, amendment or lease-related notice.",
    helps: [
      "Understand deposits, rent, escalation clauses and notice periods.",
      "See who is responsible for maintenance and repairs.",
      "Highlight terms that may need closer attention before signing.",
      "Explain practical recourse when a residential lease dispute arises.",
    ],
    documentExamples: [
      "Residential lease agreements",
      "Lease amendments",
      "Residential lease-related notices",
    ],
    groundedIn: ["Rental Housing Act", "Consumer Protection Act where applicable"],
    resultSections: LEASE_SECTIONS,
  },
  {
    slug: "policycheck",
    order: 3,
    name: "PolicyCheck",
    shortDescription: "Insurance policies and claim decisions",
    description:
      "See what your policy actually covers and excludes — or understand why a claim was rejected and what you can do next.",
    status: "COMING_SOON",
    operational: false,
    icon: ShieldCheck,
    tint: "var(--tint-blue)",
    moduleKey: null,
    uploadTitle: "Upload your policy or claim letter",
    uploadHint: "Policy wording, a policy schedule or a claim decision letter.",
    helps: [
      "Explain cover, exclusions, waiting periods, excesses and important conditions.",
      "Surface fees or exit terms that matter to the decision.",
      "Explain the reason given for a claim rejection or repudiation.",
      "Show the escalation or ombudsman route when the document and rules support it.",
    ],
    documentExamples: [
      "Insurance policy wording",
      "Policy schedules",
      "Claim rejection or repudiation letters",
    ],
    groundedIn: ["Policy wording", "FAIS framework", "Relevant ombudsman rules"],
    resultSections: [
      { id: "overview", label: "Overview" },
      { id: "terms", label: "Cover" },
      { id: "risks", label: "Exclusions" },
      { id: "ask", label: "Ask" },
    ],
    scopeNote: "Initial release focus: insurance policies and insurance claim decisions.",
  },
  {
    slug: "workcheck",
    order: 4,
    name: "WorkCheck",
    shortDescription: "Employment contracts and workplace letters",
    description:
      "Make sense of contracts, disciplinary notices and dismissal letters, including important steps and deadlines that may apply.",
    status: "COMING_SOON",
    operational: false,
    icon: Briefcase,
    tint: "var(--tint-sand)",
    moduleKey: null,
    uploadTitle: "Upload your employment document",
    uploadHint: "A contract, disciplinary notice or termination letter.",
    helps: [
      "Understand important employment-contract terms and minimum standards.",
      "Explain what a disciplinary notice is asking you to do and what happens next.",
      "Understand the reason and process recorded in a dismissal letter.",
      "Highlight when a matter may need CCMA attention and a referral deadline may apply.",
    ],
    documentExamples: [
      "Employment contracts",
      "Disciplinary notices",
      "Dismissal or termination letters",
    ],
    groundedIn: ["Basic Conditions of Employment Act", "Labour Relations Act", "CCMA rules"],
    resultSections: [
      { id: "overview", label: "Overview" },
      { id: "terms", label: "Key terms" },
      { id: "risks", label: "Risks" },
      { id: "ask", label: "Ask" },
    ],
  },
];

/** Products in customer-facing order. */
export const SOLUTION_LIST: Solution[] = [...SOLUTIONS].sort((a, b) => a.order - b.order);

export function findSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}

export function solutionForModule(module: DocumentModule | null): Solution | undefined {
  if (!module) return undefined;
  return (
    SOLUTIONS.find((solution) => solution.moduleKey === module) ??
    SOLUTIONS.find((solution) => solution.name.toUpperCase().startsWith(module))
  );
}

/** Icon + tint for a backend module, including modules with no live product. */
export function moduleVisual(module: DocumentModule | null): { icon: LucideIcon; tint: string } {
  const byModule: Partial<Record<DocumentModule, Solution | undefined>> = {
    TAX: findSolution("taxsnap"),
    LEASE: findSolution("leasecheck"),
    WORK: findSolution("workcheck"),
  };
  const solution = module ? byModule[module] : undefined;
  if (solution) return { icon: solution.icon, tint: solution.tint };
  return { icon: FileText, tint: "var(--paper-2)" };
}

export function resultSectionsForModule(module: DocumentModule | null): ResultSection[] {
  return solutionForModule(module)?.resultSections ?? TAX_SECTIONS;
}

export function solutionStatusLabel(status: SolutionStatus): string {
  return status === "AVAILABLE" ? "Available" : "Coming soon";
}
