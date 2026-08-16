import { apiRequest, ApiError } from "./api-client";

/**
 * Entitlements come straight from Railway — the backend is the source of truth
 * for plan, usage and feature access. Nothing here re-implements plan rules.
 */
export type Entitlements = {
  plan: string;
  planLabel: string;
  isPlus: boolean;
  vaultEnabled: boolean;
  remindersEnabled: boolean;
  pushRemindersEnabled: boolean;
  unlimitedAnalyses: boolean;
  monthlyAnalysisLimit: number | null;
  monthlyAnalysisUsed: number | null;
  remainingAnalyses: number | null;
  retentionDays: number | null;
};

type RawEntitlements = Record<string, unknown>;

type EntitlementsApiResponse = {
  success: boolean;
  data: { entitlements: RawEntitlements };
};

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function pick(raw: RawEntitlements, ...keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

export function normaliseEntitlements(raw: RawEntitlements): Entitlements {
  const plan = typeof raw['plan'] === "string" ? raw['plan'] : "FREE";
  const isPlus = plan.toUpperCase() !== "FREE";

  const limit = num(pick(raw, "monthlyAnalysisLimit", "analysisLimit", "monthlyLimit"));
  const used = num(pick(raw, "monthlyAnalysisUsed", "analysesUsed", "monthlyUsage"));
  const remaining = num(
    pick(raw, "remainingAnalyses", "analysesRemaining", "remainingFreeAnalyses"),
  );
  const unlimited =
    bool(pick(raw, "unlimitedAnalyses"), false) || (limit === null && isPlus);

  return {
    plan,
    planLabel: isPlus ? "Untangle Plus" : "Free",
    isPlus,
    vaultEnabled: bool(pick(raw, "vaultEnabled", "vaultAccess"), !isPlus ? false : true),
    remindersEnabled: bool(pick(raw, "remindersEnabled", "reminderAccess"), isPlus),
    pushRemindersEnabled: bool(raw['pushRemindersEnabled'], false),
    unlimitedAnalyses: unlimited,
    monthlyAnalysisLimit: limit,
    monthlyAnalysisUsed: used,
    remainingAnalyses:
      remaining !== null ? remaining : limit !== null && used !== null ? Math.max(limit - used, 0) : null,
    retentionDays: num(pick(raw, "retentionDays", "retentionPeriodDays")),
  };
}

/** GET /api/v1/entitlements */
export async function fetchEntitlements(): Promise<Entitlements> {
  const response = await apiRequest<EntitlementsApiResponse>("/api/v1/entitlements", {
    method: "GET",
  });
  return normaliseEntitlements(response.data.entitlements ?? {});
}

/** True when the backend rejected a call because the feature needs Untangle Plus. */
export function isFeatureRequiresPlus(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.code === "FEATURE_REQUIRES_PLUS" || error.status === 403)
  );
}

export function friendlyEntitlementError(error: unknown): string {
  if (isFeatureRequiresPlus(error)) return "This feature is part of Untangle Plus.";
  if (error instanceof ApiError && error.status === 0)
    return "We could not reach Untangle. Check your connection and try again.";
  return "We could not load your plan right now. Please try again shortly.";
}

export function usageLine(entitlements: Entitlements): string | null {
  if (entitlements.unlimitedAnalyses) return "Unlimited analyses on Untangle Plus.";
  const { monthlyAnalysisUsed: used, monthlyAnalysisLimit: limit } = entitlements;
  if (used === null || limit === null) return null;
  return `${used} of ${limit} free analyses used this month.`;
}
