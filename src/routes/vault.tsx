import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import { DocCard } from "@/components/untangle/DocCard";
import { FAB } from "@/components/untangle/FAB";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  friendlyDocumentError,
  listDocuments,
  moduleLabel,
  type DocumentListItem,
} from "@/lib/documents";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Untangle" },
      { name: "description", content: "Every document you've untangled, stored in one place." },
      { property: "og:title", content: "Vault — Untangle" },
      {
        property: "og:description",
        content: "Every document you've untangled, stored in one place.",
      },
    ],
  }),
  component: withAuth(Vault),
});

const MODULE_ICON: Record<string, { icon: string; bg: string }> = {
  TaxSnap: { icon: "📨", bg: "var(--tint-red)" },
  LeaseCheck: { icon: "🏠", bg: "var(--teal-dim)" },
  DealCheck: { icon: "🤝", bg: "var(--tint-sand)" },
  WorkCheck: { icon: "💼", bg: "var(--tint-sand)" },
  Other: { icon: "📄", bg: "var(--paper-2)" },
};

const PROCESSING_STATUSES = new Set([
  "QUEUED",
  "DETECTING_MODULE",
  "CLASSIFYING",
  "EXTRACTING",
  "VALIDATING_RESULT",
  "MATCHING_RULES",
  "NEEDS_REVIEW",
]);

function Vault() {
  const navigate = useNavigate();
  const { entitlements } = useEntitlements();
  const vaultLocked = entitlements ? !entitlements.vaultEnabled : false;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data, isPending, error } = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocuments(),
    retry: false,
    enabled: !vaultLocked,
  });

  const documents = useMemo(() => data?.data.documents ?? [], [data]);

  // Filters are derived from real data only — never from the product catalogue.
  const filters = useMemo(() => {
    const labels: string[] = [];
    for (const doc of documents) {
      const label = moduleLabel(doc.module);
      if (!labels.includes(label)) labels.push(label);
    }
    return ["All", ...labels];
  }, [documents]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return documents
      .filter((doc) => filter === "All" || moduleLabel(doc.module) === filter)
      .filter((doc) =>
        term.length === 0
          ? true
          : `${documentDisplayTitle(doc)} ${doc.originalFilename} ${moduleLabel(doc.module)}`
              .toLowerCase()
              .includes(term),
      )
      .slice()
      .sort((a, b) => {
        const at = new Date(a.createdAt).getTime();
        const bt = new Date(b.createdAt).getTime();
        return sort === "newest" ? bt - at : at - bt;
      });
  }, [documents, filter, search, sort]);

  const openDocument = (doc: DocumentListItem) => {
    if (doc.processingStatus === "COMPLETED") {
      navigate({ to: "/result", search: { documentId: doc.documentId, from: "vault" as const } });
      return;
    }
    if (PROCESSING_STATUSES.has(doc.processingStatus)) {
      navigate({ to: "/processing/$documentId", params: { documentId: doc.documentId } });
    }
  };

  const isOpenable = (doc: DocumentListItem) =>
    doc.processingStatus === "COMPLETED" || PROCESSING_STATUSES.has(doc.processingStatus);

  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="mx-auto w-full max-w-md px-5 pt-8">
        <h1 className="font-display text-[24px] font-semibold text-ink">Vault</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Everything you've untangled, searchable and sorted.
        </p>

        {vaultLocked ? (
          <div className="mt-6">
            <UpgradePrompt
              title="Vault is part of Plus"
              message="Untangle Plus keeps every document you've untangled, together with its reminders."
            />
          </div>
        ) : isPending ? (
          <p className="mt-8 text-[14px] text-ink-soft">Loading your documents…</p>
        ) : error ? (
          <p className="mt-8 text-[14px] text-ink-soft">{friendlyDocumentError(error)}</p>
        ) : documents.length === 0 ? (
          <div className="mt-10 rounded-[16px] border border-dashed border-line bg-white/60 p-5 text-center">
            <p className="text-[16px] font-bold text-ink">No documents yet</p>
            <p className="mt-2 text-[13px] text-ink-soft">
              Upload your first document and Untangle will keep it here.
            </p>
          </div>
        ) : (
          <>
            <label className="mt-5 block">
              <span className="sr-only">Search your documents</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search documents"
                className="w-full rounded-[12px] border border-line bg-white px-4 py-[11px] text-[14px] text-ink outline-none placeholder:text-ink-soft focus:border-teal"
              />
            </label>

            {filters.length > 2 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFilter(label)}
                    className={`rounded-full px-3.5 py-[6px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${
                      filter === label
                        ? "bg-ink text-paper"
                        : "border border-line bg-white text-ink-soft"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between">
              <p className="text-[12px] text-ink-soft">
                {visible.length} of {documents.length} document{documents.length === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
                className="text-[12.5px] font-semibold text-teal"
              >
                {sort === "newest" ? "Newest first" : "Oldest first"} ⇅
              </button>
            </div>

            {visible.length === 0 ? (
              <p className="mt-8 text-[14px] text-ink-soft">
                No documents match your search.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {visible.map((doc) => {
                  const visual = MODULE_ICON[moduleLabel(doc.module)] ?? MODULE_ICON['Other']!;
                  const card = (
                    <DocCard
                      icon={visual.icon}
                      iconBg={visual.bg}
                      title={documentDisplayTitle(doc)}
                      subtitle={`${moduleLabel(doc.module)} · ${documentStatusSubtitle(doc)}`}
                    />
                  );
                  return isOpenable(doc) ? (
                    <button
                      key={doc.documentId}
                      type="button"
                      onClick={() => openDocument(doc)}
                      className="block w-full text-left"
                    >
                      {card}
                    </button>
                  ) : (
                    <div key={doc.documentId}>{card}</div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {vaultLocked ? null : <FAB />}
      <BottomTabBar active="Vault" />
    </div>
  );
}
