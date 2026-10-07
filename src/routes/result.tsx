import { AppShell } from "@/components/untangle/v2/AppShell";
import { PageState } from "@/components/untangle/v2/PageState";
import { useEntitlements } from "@/hooks/useEntitlements";
import { withAuth } from "@/auth/ProtectedRoute";
import { LeaseResultV2 } from "@/components/untangle/v2/LeaseResultV2";
import { TaxResultV2 } from "@/components/untangle/v2/TaxResultV2";
import {
  friendlyDocumentError,
  getDocumentResult,
  type DocumentResult,
  type LeaseDocumentResult,
} from "@/lib/documents";
import { parseResultOrigin, resultBackTarget, type ResultOrigin } from "@/lib/navigation";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

type ResultSearch = { documentId: string; from: ResultOrigin };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/result")({
  validateSearch: (search: Record<string, unknown>): ResultSearch => {
    const value = typeof search["documentId"] === "string" ? search["documentId"] : "";
    return {
      documentId: UUID_RE.test(value) ? value : "",
      from: parseResultOrigin(search["from"]),
    };
  },
  head: () => ({
    meta: [
      { title: "Document result — Untangle South Africa" },
      {
        name: "description",
        content:
          "A plain-English explanation of what your document means, what matters and what to do next.",
      },
      { property: "og:title", content: "Document result — Untangle South Africa" },
      {
        property: "og:description",
        content: "Understand the document, the important details and what to do next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: withAuth(Result),
});

function isLeaseResult(result: DocumentResult): result is LeaseDocumentResult {
  return result.document.module === "LEASE";
}

function Result() {
  const { documentId, from } = Route.useSearch();
  const back = resultBackTarget(from);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["document-result", documentId],
    queryFn: () => getDocumentResult(documentId),
    enabled: documentId !== "",
    retry: false,
  });

  if (documentId === "") {
    return (
      <ResultState
        back={back}
        title="We could not find this result"
        body="Open the document again from Documents to view its result."
      />
    );
  }

  if (isPending) {
    return (
      <ResultState
        back={back}
        title="Loading your result…"
        body="One moment while Untangle fetches the validated analysis."
        loading
      />
    );
  }

  const result = data?.data.result;

  if (error || !result) {
    return (
      <ResultState
        back={back}
        title="This result could not be loaded"
        body={friendlyDocumentError(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isLeaseResult(result)) {
    return <LeaseResultV2 result={result} documentId={documentId} back={back} />;
  }

  if (result.document.module === "TAX")
    return <TaxResultV2 result={result} documentId={documentId} back={back} />;
  return (
    <ResultState
      back={back}
      title="This specialist result is not available yet"
      body="Return to Documents or choose an available product on Home."
    />
  );
}

function ResultState({
  back,
  title,
  body,
  loading = false,
  onRetry,
}: {
  back: { to: string; label: string };
  title: string;
  body: string;
  loading?: boolean;
  onRetry?: (() => void) | undefined;
}) {
  const { entitlements } = useEntitlements();
  return (
    <AppShell active="Documents" planLabel={entitlements?.planLabel ?? "Account"}>
      <header className="border-b border-line/80 bg-paper">
        <div className="mx-auto flex min-h-[72px] max-w-3xl items-center px-4 sm:px-6">
          <Link
            to={back.to}
            aria-label={"Back to " + back.label}
            className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-paper-2"
          >
            <ArrowLeft size={20} aria-hidden />
          </Link>
          <div className="ml-2">
            <h1 className="text-[18px] font-semibold text-ink">Document result</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl py-6">
        <PageState title={title} body={body} loading={loading} onRetry={onRetry} />
      </div>
    </AppShell>
  );
}
