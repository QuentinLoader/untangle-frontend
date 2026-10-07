import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { withAuth } from "@/auth/ProtectedRoute";
import { AppShell } from "@/components/untangle/v2/AppShell";
import { BlockCard } from "@/components/untangle/BlockCard";
import { PrimaryButton, SecondaryButton } from "@/components/untangle/Buttons";
import { ENTITLEMENTS_QUERY_KEY, useEntitlements } from "@/hooks/useEntitlements";
import {
  friendlyBillingError,
  isAttemptCancelled,
  isAttemptComplete,
  isAttemptFailed,
  verifyAttempt,
  type VerifyResult,
} from "@/lib/billing";

type BillingSearch = { status: string | undefined; attemptId: string | undefined };

export const Route = createFileRoute("/billing")({
  validateSearch: (search: Record<string, unknown>): BillingSearch => ({
    status: typeof search['status'] === "string" ? search['status'] : undefined,
    attemptId: typeof search['attemptId'] === "string" ? search['attemptId'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirming your payment — Untangle" },
      {
        name: "description",
        content: "Untangle confirms your Plus payment before unlocking your features.",
      },
      { property: "og:title", content: "Confirming your payment — Untangle" },
      {
        property: "og:description",
        content: "Untangle confirms your Plus payment before unlocking your features.",
      },
    ],
  }),
  component: withAuth(BillingReturnPage),
});

/** ~18 seconds of bounded automatic confirmation. */
const RETRY_INTERVAL_MS = 3000;
const MAX_AUTO_ATTEMPTS = 6;

const UUID_RE = /^[0-9a-fA-F-]{8,64}$/;

function BillingReturnPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { entitlements } = useEntitlements();
  const { status, attemptId } = Route.useSearch();
  const [autoAttempts, setAutoAttempts] = useState(0);

  const validAttemptId = attemptId && UUID_RE.test(attemptId) ? attemptId : null;

  const query = useQuery<VerifyResult>({
    queryKey: ["billing-attempt", validAttemptId],
    queryFn: async () => {
      const result = await verifyAttempt(validAttemptId as string);
      setAutoAttempts((n) => n + 1);
      if (isAttemptComplete(result)) {
        await queryClient.invalidateQueries({ queryKey: ENTITLEMENTS_QUERY_KEY });
        // Plus unlocks vault and reminder data, so refetch both.
        await queryClient.invalidateQueries({ queryKey: ["documents"] });
        await queryClient.invalidateQueries({ queryKey: ["reminders"] });
      }
      return result;
    },
    enabled: !!validAttemptId,
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
    refetchInterval: (q) => {
      const data = q.state.data;
      if (data && (isAttemptComplete(data) || isAttemptCancelled(data) || isAttemptFailed(data)))
        return false;
      if (autoAttempts >= MAX_AUTO_ATTEMPTS) return false;
      return RETRY_INTERVAL_MS;
    },
  });

  const result = query.data;
  const checkAgain = () => {
    setAutoAttempts(0);
    void query.refetch();
  };

  const body = (() => {
    if (!validAttemptId) {
      return (
        <BlockCard title="Nothing to confirm">
          <p className="text-[13px] text-ink-soft">
            We don't have a payment to confirm here. If you were upgrading, you can start again from
            the Untangle Plus screen.
          </p>
        </BlockCard>
      );
    }

    if (query.isPending) {
      return (
        <BlockCard title="Please wait">
          <p className="text-[13px] text-ink-soft">Confirming your payment…</p>
        </BlockCard>
      );
    }

    if (query.isError) {
      return (
        <BlockCard title="We hit a snag">
          <p className="text-[13px] text-ink-soft">{friendlyBillingError(query.error)}</p>
        </BlockCard>
      );
    }

    if (isAttemptComplete(result)) {
      return (
        <BlockCard title="Payment confirmed">
          <p className="text-[15px] font-bold text-ink">Untangle Plus is active</p>
          <p className="mt-1 text-[13px] text-ink-soft">Your Plus features are ready to use.</p>
        </BlockCard>
      );
    }

    if (isAttemptCancelled(result)) {
      return (
        <BlockCard title="Payment cancelled">
          <p className="text-[13px] text-ink-soft">
            This payment was cancelled, so nothing was charged and your plan hasn't changed.
          </p>
        </BlockCard>
      );
    }

    if (isAttemptFailed(result)) {
      return (
        <BlockCard title="Payment not completed">
          <p className="text-[13px] text-ink-soft">
            This payment didn't go through. You can try again whenever you're ready.
          </p>
        </BlockCard>
      );
    }

    if (autoAttempts >= MAX_AUTO_ATTEMPTS) {
      return (
        <BlockCard title="Still confirming">
          <p className="text-[13px] text-ink-soft">
            We're still confirming your payment. This can take a short while after your bank
            responds. You don't need to pay again — check again in a moment.
          </p>
        </BlockCard>
      );
    }

    return (
      <BlockCard title="Please wait">
        <p className="text-[13px] text-ink-soft">Confirming your payment…</p>
        {status === "cancelled" ? (
          <p className="mt-1 text-[13px] text-ink-soft">
            It looks like the payment was stopped — we're checking with your bank.
          </p>
        ) : null}
      </BlockCard>
    );
  })();

  const showCheckAgain =
    !!validAttemptId && !isAttemptComplete(result) && !isAttemptCancelled(result);

  return (
    <AppShell active="Account" planLabel={entitlements?.isPlus ? "Plus" : "Free"}>
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-[28px] tracking-[-0.03em] font-semibold text-ink">Your payment</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Untangle confirms every payment before unlocking Plus.
        </p>

        <div className="mt-5 space-y-3">
          {body}

          {isAttemptComplete(result) ? (
            <PrimaryButton onClick={() => navigate({ to: "/home" })}>
              Continue to Untangle
            </PrimaryButton>
          ) : (
            <>
              {showCheckAgain ? (
                <PrimaryButton onClick={checkAgain} disabled={query.isFetching}>
                  {query.isFetching ? "Checking…" : "Check again"}
                </PrimaryButton>
              ) : null}
              <SecondaryButton onClick={() => navigate({ to: "/upgrade" })}>
                {isAttemptCancelled(result) ? "Try again" : "Back to Untangle Plus"}
              </SecondaryButton>
            </>
          )}

          <SecondaryButton onClick={() => navigate({ to: "/home" })}>Back to Untangle</SecondaryButton>
        </div>
      </div>
    </AppShell>
  );
}
