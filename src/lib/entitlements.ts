import { apiRequest, ApiError } from "./api-client";

/**
 * Entitlements come straight from Railway — the backend is the source of truth
 * for plan, usage and feature access. Nothing here re-implements plan rules.
 */
export type Entitlements = {
  plan: string;
  planLabel: string;
  isPlus: boolean;
  subscriptionStatus: string | null;
  billingProvider: string | null;
  currentPeriodEnd: string | null;
  vaultEnabled: boolean;
  remindersEnabled: boolean;
  pushRemindersEnabled: boolean;
  calendarExportEnabled: boolean;
  unlimitedAnalyses: boolean;
  monthlyAnalysisLimit: number | null;
  monthlyAnalysisUsed: number | null;
  remainingAnalyses: number | null;
  retentionDays: number | null;
};

type RawRecord = Record<string, unknown>;

type EntitlementsApiResponse = {
  success: boolean;
  data: RawRecord;
};

function asRecord(value: unknown): RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as RawRecord)
    : {};
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function pick(raw: RawRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

/**
 * Accepts the current backend contract:
 * data: { plan, entitlements, subscription, usage }
 *
 * The fallback keys intentionally keep compatibility with the earlier flat
 * frontend shape while deployed clients/backends roll forward.
 */
export function normaliseEntitlements(payload: RawRecord): Entitlements {
  const featureRaw = asRecord(payload["entitlements"] ?? payload);
  const usageRaw = asRecord(payload["usage"]);
  const subscriptionRaw = asRecord(payload["subscription"]);

  const plan =
    str(payload["plan"]) ??
    str(subscriptionRaw["effectivePlan"]) ??
    str(featureRaw["plan"]) ??
    "FREE";

  const upperPlan = plan.toUpperCase();
  const isPlus = upperPlan.includes("PLUS") || plan.toLowerCase().startsWith("plus_");

  const limit =
    num(usageRaw["limit"]) ??
    num(
      pick(
        featureRaw,
        "successfulAnalysesPerCalendarMonth",
        "monthlyAnalysisLimit",
        "analysisLimit",
        "monthlyLimit",
      ),
    );

  const used =
    num(usageRaw["successfulAnalyses"]) ??
    num(pick(featureRaw, "monthlyAnalysisUsed", "analysesUsed", "monthlyUsage"));

  const remaining =
    num(usageRaw["remaining"]) ??
    num(
      pick(
        featureRaw,
        "remainingAnalyses",
        "analysesRemaining",
        "remainingFreeAnalyses",
      ),
    );

  const unlimited =
    isPlus || bool(pick(featureRaw, "unlimitedAnalyses"), false);

  return {
    plan,
    planLabel: isPlus ? "Untangle Plus" : "Free",
    isPlus,
    subscriptionStatus: str(subscriptionRaw["status"]),
    billingProvider: str(subscriptionRaw["provider"]),
    currentPeriodEnd: str(subscriptionRaw["currentPeriodEnd"]),
    vaultEnabled: bool(featureRaw["vaultEnabled"], isPlus),
    remindersEnabled: bool(
      pick(featureRaw, "inAppRemindersEnabled", "remindersEnabled", "reminderAccess"),
      isPlus,
    ),
    pushRemindersEnabled: bool(featureRaw["pushRemindersEnabled"], false),
    calendarExportEnabled: bool(featureRaw["calendarExportEnabled"], false),
    unlimitedAnalyses: unlimited,
    monthlyAnalysisLimit: limit,
    monthlyAnalysisUsed: used,
    remainingAnalyses:
      remaining !== null
        ? remaining
        : limit !== null && used !== null
          ? Math.max(limit - used, 0)
          : null,
    retentionDays: num(
      pick(featureRaw, "historyRetentionDays", "retentionDays", "retentionPeriodDays"),
    ),
  };
}

/** GET /api/v1/entitlements */
export async function fetchEntitlements(): Promise<Entitlements> {
  const response = await apiRequest<EntitlementsApiResponse>("/api/v1/entitlements", {
    method: "GET",
  });
  return normaliseEntitlements(response.data ?? {});
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
