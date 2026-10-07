import { createFileRoute } from "@tanstack/react-router";
import { withAuth } from "@/auth/ProtectedRoute";
import { WorkResultV2 } from "@/components/untangle/v2/WorkResultV2";

export const Route = createFileRoute("/prototype/workcheck-v2")({
  head: () => ({ meta: [{ title: "WorkCheck V2 prototype — Untangle South Africa" }] }),
  component: withAuth(WorkResultV2),
});
