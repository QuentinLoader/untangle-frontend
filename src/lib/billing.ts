import { apiRequest, ApiError } from "./api-client";

/**
 * Billing is owned by the Railway backend. The frontend never signs Ozow data,
 * never creates transaction references and never decides that a payment succeeded.
 */

export type BillingPlan = "PLUS_MONTHLY" | "PLUS_ANNUAL";

export type BillingAttempt = {
  id: string;
  plan: string;
  provider: string;
  status: string;
  amountCents: number | null;
  currencyCode: string | null;
  transactionReference: string | null;
  isTest: boolean;
};

export type CheckoutInstruction = {
  method: string;
  actionUrl: string;
  fields: Record<string, string>;
};

type CheckoutApiResponse = {
  success: boolean;
  data: {
    attempt?: Partial<BillingAttempt>;
    checkout?: Partial<CheckoutInstruction> & { fields?: Record<string, unknown> };
  };
};

export type VerifyResult = {
  attemptId: string | null;
  plan: string | null;
  status: string;
  verified: boolean;
  subscriptionActivated: boolean;
};

type VerifyApiResponse = {
  success: boolean;
  data: Partial<VerifyResult> & { status?: string };
};

/** POST /api/v1/billing/checkout — backend creates the attempt and signs the Ozow fields. */
export async function createCheckout(plan: BillingPlan): Promise<{
  attempt: BillingAttempt | null;
  checkout: CheckoutInstruction;
}> {
  const response = await apiRequest<CheckoutApiResponse>("/api/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });

  const rawCheckout = response.data?.checkout;
  const actionUrl = typeof rawCheckout?.actionUrl === "string" ? rawCheckout.actionUrl : "";
  const rawFields = rawCheckout?.fields;

  if (!actionUrl || !rawFields || typeof rawFields !== "object") {
    throw new ApiError("Checkout could not be started.", 0);
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawFields)) {
    if (value === null || value === undefined) continue;
    fields[key] = String(value);
  }

  const rawAttempt = response.data?.attempt;
  const attempt: BillingAttempt | null =
    rawAttempt && typeof rawAttempt.id === "string"
      ? {
          id: rawAttempt.id,
          plan: String(rawAttempt.plan ?? ""),
          provider: String(rawAttempt.provider ?? ""),
          status: String(rawAttempt.status ?? ""),
          amountCents: typeof rawAttempt.amountCents === "number" ? rawAttempt.amountCents : null,
          currencyCode:
            typeof rawAttempt.currencyCode === "string" ? rawAttempt.currencyCode : null,
          transactionReference:
            typeof rawAttempt.transactionReference === "string"
              ? rawAttempt.transactionReference
              : null,
          isTest: rawAttempt.isTest === true,
        }
      : null;

  return {
    attempt,
    checkout: {
      method: (typeof rawCheckout?.method === "string" ? rawCheckout.method : "POST").toUpperCase(),
      actionUrl,
      fields,
    },
  };
}

/**
 * Hands the browser to Ozow with an HTML form POST, submitting exactly the
 * fields the backend returned. Nothing here is modified or recalculated.
 */
export function submitCheckoutForm(checkout: CheckoutInstruction): void {
  if (typeof document === "undefined") return;

  const form = document.createElement("form");
  form.method = checkout.method === "GET" ? "GET" : "POST";
  form.action = checkout.actionUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(checkout.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

/** POST /api/v1/billing/attempts/:attemptId/verify — the only proof of payment. */
export async function verifyAttempt(attemptId: string): Promise<VerifyResult> {
  const response = await apiRequest<VerifyApiResponse>(
    `/api/v1/billing/attempts/${encodeURIComponent(attemptId)}/verify`,
    { method: "POST" },
  );

  const data = response.data ?? {};
  return {
    attemptId: typeof data.attemptId === "string" ? data.attemptId : attemptId,
    plan: typeof data.plan === "string" ? data.plan : null,
    status: typeof data.status === "string" ? data.status.toUpperCase() : "PENDING",
    verified: data.verified === true,
    subscriptionActivated: data.subscriptionActivated === true,
  };
}

export function isAttemptComplete(result: VerifyResult | undefined | null): boolean {
  return !!result && result.verified && result.status === "COMPLETE";
}

export function isAttemptCancelled(result: VerifyResult | undefined | null): boolean {
  return !!result && (result.status === "CANCELLED" || result.status === "CANCELED");
}

export function isAttemptFailed(result: VerifyResult | undefined | null): boolean {
  return !!result && (result.status === "ERROR" || result.status === "FAILED");
}

export function friendlyBillingError(error: unknown): string {
  if (error instanceof ApiError && error.status === 0)
    return "We could not reach Untangle. Check your connection and try again.";
  if (error instanceof ApiError && error.status === 404)
    return "We could not find that payment. Please start again from the upgrade screen.";
  return "Something went wrong on our side. Please try again in a moment.";
}

/** Formats cents into South African rand, e.g. R79. */
export function formatRands(amountCents: number | null): string | null {
  if (amountCents === null) return null;
  const rands = amountCents / 100;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: rands % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rands);
}
