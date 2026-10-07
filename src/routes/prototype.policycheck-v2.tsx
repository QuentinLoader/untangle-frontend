import { createFileRoute } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { PolicyResultV2 } from "@/components/untangle/v2/PolicyResultV2";

export const Route = createFileRoute("/prototype/policycheck-v2")({
  head: () => ({
    meta: [
      { title: "PolicyCheck V2 prototype — Untangle South Africa" },
      {
        name: "description",
        content: "Authenticated synthetic prototype of the PolicyCheck customer result experience.",
      },
    ],
  }),
  component: withAuth(PolicyCheckPrototype),
});

function PolicyCheckPrototype() {
  return <PolicyResultV2 />;
}
