import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import { DocCard } from "@/components/untangle/DocCard";
import {
  documentDisplayTitle,
  documentStatusSubtitle,
  friendlyDocumentError,
  listDocuments,
  moduleLabel,
  deleteDocument,
  friendlyDeleteError,
  type DocumentListItem,
} from "@/lib/documents";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Untangle" },
      { name: "description", content: "Your uploaded documents, stored and managed in one place." },
      { property: "og:title", content: "Vault — Untangle" },
      {
        property: "og:description",
        content: "Your uploaded documents, stored and managed in one place.",
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

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const removeDocument = useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: async () => {
      setConfirmId(null);
      setMenuId(null);
      setDeleteError(null);
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (mutationError) => {
      setDeleteError(friendlyDeleteError(mutationError));
    },
  });

  const { data, isPending, error } = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocuments(),
    retry: false,
    enabled: !vaultLocked,
  });

  const documents = useMemo(() => data?.data.documents ?? [], [data]);

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
    setMenuId(null);
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
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          This is the one place for your uploaded documents. Open, search or delete them here.
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
              Upload your first document and it will appear here.
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
                className="min-h-[48px] w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[16px] text-ink outline-none placeholder:text-ink-soft focus:border-teal"
              />
            </label>

            {filters.length > 2 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFilter(label)}
                    className={`inline-flex min-h-[44px] items-center rounded-full px-4 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors active:scale-[0.97] ${
                      filter === label ? "bg-ink text-paper" : "border border-line bg-white text-ink-soft active:bg-paper-2"
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
                className="inline-flex min-h-[44px] items-center rounded-[10px] px-2 text-[12.5px] font-semibold text-teal active:bg-teal-dim"
              >
                {sort === "newest" ? "Newest first" : "Oldest first"} ⇅
              </button>
            </div>

            {deleteError ? (
              <p className="mt-3 rounded-[12px] border border-line bg-white px-3 py-2 text-[12.5px] text-ink">
                {deleteError}
              </p>
            ) : null}

            {visible.length === 0 ? (
              <p className="mt-8 text-[14px] text-ink-soft">No documents match your search.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {visible.map((doc) => {
                  const visual = MODULE_ICON[moduleLabel(doc.module)] ?? MODULE_ICON["Other"]!;
                  const confirming = confirmId === doc.documentId;
                  const menuOpen = menuId === doc.documentId;
                  const busy = removeDocument.isPending && confirming;

                  return (
                    <div key={doc.documentId} className="relative">
                      {isOpenable(doc) ? (
                        <button
                          type="button"
                          onClick={() => openDocument(doc)}
                          className="block w-full rounded-2xl pr-12 text-left transition-transform active:scale-[0.99]"
                        >
                          <DocCard
                            icon={visual.icon}
                            iconBg={visual.bg}
                            title={documentDisplayTitle(doc)}
                            subtitle={`${moduleLabel(doc.module)} · ${documentStatusSubtitle(doc)}`}
                          />
                        </button>
                      ) : (
                        <div className="pr-12">
                          <DocCard
                            icon={visual.icon}
                            iconBg={visual.bg}
                            title={documentDisplayTitle(doc)}
                            subtitle={`${moduleLabel(doc.module)} · ${documentStatusSubtitle(doc)}`}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        aria-label={`Actions for ${documentDisplayTitle(doc)}`}
                        aria-expanded={menuOpen}
                        onClick={() => {
                          setDeleteError(null);
                          setConfirmId(null);
                          setMenuId(menuOpen ? null : doc.documentId);
                        }}
                        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-soft active:bg-paper-2"
                      >
                        <MoreVertical className="h-4.5 w-4.5" aria-hidden="true" />
                      </button>

                      {menuOpen && !confirming ? (
                        <div className="absolute right-3 top-12 z-10 w-40 overflow-hidden rounded-[12px] border border-line bg-white shadow-lg">
                          {isOpenable(doc) ? (
                            <button
                              type="button"
                              onClick={() => openDocument(doc)}
                              className="block min-h-[48px] w-full px-4 py-3 text-left text-[13px] font-semibold text-ink active:bg-paper-2"
                            >
                              Open
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setConfirmId(doc.documentId)}
                            className="flex min-h-[48px] w-full items-center gap-2 border-t border-line px-4 py-3 text-left text-[13px] font-semibold text-red-600 active:bg-paper-2"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      ) : null}

                      {confirming ? (
                        <div className="mt-2 rounded-[14px] border border-line bg-white px-4 py-3">
                          <p className="text-[13px] font-semibold text-ink">Delete this document?</p>
                          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                            This removes the uploaded file, its analysis and related reminders from your Vault.
                          </p>
                          <div className="mt-3 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmId(null);
                                setMenuId(null);
                              }}
                              className="inline-flex min-h-[44px] items-center rounded-[10px] px-3 text-[12.5px] font-semibold text-ink-soft active:bg-paper-2"
                              disabled={busy}
                            >
                              Keep it
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument.mutate(doc.documentId)}
                              className="inline-flex min-h-[44px] items-center rounded-[10px] px-3 text-[12.5px] font-bold text-red-600 active:bg-red-50"
                              disabled={busy}
                            >
                              {busy ? "Deleting…" : "Delete permanently"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomTabBar active="Vault" />
    </div>
  );
}
