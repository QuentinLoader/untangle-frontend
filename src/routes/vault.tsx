import { withAuth } from "@/auth/ProtectedRoute";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomTabBar } from "@/components/untangle/BottomTabBar";
import { ScreenHeader } from "@/components/untangle/ScreenHeader";
import { UpgradePrompt } from "@/components/untangle/UpgradePrompt";
import { useEntitlements } from "@/hooks/useEntitlements";
import { moduleVisual } from "@/lib/solutions";
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
      { title: "Documents — Untangle" },
      { name: "description", content: "Your uploaded documents, stored and managed in one place." },
      { property: "og:title", content: "Documents — Untangle" },
      {
        property: "og:description",
        content: "Your uploaded documents, stored and managed in one place.",
      },
    ],
  }),
  component: withAuth(Vault),
});

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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [documents, filter, search]);

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
    <div className="min-h-screen bg-paper pb-[104px]">
      <div className="mx-auto w-full max-w-md px-5 pt-8">
        <ScreenHeader title="Documents" subtitle="Everything you've uploaded to Untangle." />

        {vaultLocked ? (
          <div className="mt-6">
            <UpgradePrompt
              title="Documents are part of Plus"
              message="Untangle Plus keeps every document you've untangled, together with its reminders."
            />
          </div>
        ) : isPending ? (
          <p className="mt-8 text-[14px] text-ink-soft">Loading your documents…</p>
        ) : error ? (
          <p className="mt-8 text-[14px] text-ink-soft">{friendlyDocumentError(error)}</p>
        ) : documents.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center">
            <p className="text-[16px] font-semibold text-ink">No documents yet</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
              Choose a product on Home and upload your first document.
            </p>
          </div>
        ) : (
          <>
            <label className="relative mt-6 block">
              <span className="sr-only">Search your documents</span>
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search documents"
                className="min-h-[48px] w-full rounded-2xl border border-line/70 bg-white pl-11 pr-4 text-[16px] text-ink outline-none placeholder:text-ink-soft focus:border-teal"
              />
            </label>

            {filters.length > 2 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFilter(label)}
                    className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-[13px] font-medium transition-colors ${
                      filter === label
                        ? "bg-ink text-white"
                        : "border border-line bg-white text-ink-soft active:bg-paper-2"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {deleteError ? (
              <p className="mt-3 rounded-xl border border-line bg-white px-3 py-2 text-[12.5px] text-ink">
                {deleteError}
              </p>
            ) : null}

            {visible.length === 0 ? (
              <p className="mt-8 text-[14px] text-ink-soft">No documents match your search.</p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {visible.map((doc) => {
                  const visual = moduleVisual(doc.module);
                  const Icon = visual.icon;
                  const confirming = confirmId === doc.documentId;
                  const menuOpen = menuId === doc.documentId;
                  const busy = removeDocument.isPending && confirming;
                  const openable = isOpenable(doc);

                  return (
                    <div key={doc.documentId} className="relative">
                      <div
                        role={openable ? "button" : undefined}
                        tabIndex={openable ? 0 : undefined}
                        onClick={openable ? () => openDocument(doc) : undefined}
                        onKeyDown={
                          openable
                            ? (event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  openDocument(doc);
                                }
                              }
                            : undefined
                        }
                        className={`flex min-h-[76px] items-center gap-3.5 rounded-2xl border border-line/70 bg-white py-4 pl-4 pr-14 ${
                          openable ? "cursor-pointer transition-colors active:bg-paper-2" : ""
                        }`}
                      >
                        <span
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-teal"
                          style={{ backgroundColor: visual.tint }}
                          aria-hidden
                        >
                          <Icon size={19} strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-ink">
                            {documentDisplayTitle(doc)}
                          </span>
                          <span className="mt-0.5 block truncate text-[12.5px] text-ink-soft">
                            {moduleLabel(doc.module)} · {documentStatusSubtitle(doc)}
                          </span>
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label={`Actions for ${documentDisplayTitle(doc)}`}
                        aria-expanded={menuOpen}
                        onClick={() => {
                          setDeleteError(null);
                          setConfirmId(null);
                          setMenuId(menuOpen ? null : doc.documentId);
                        }}
                        className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft active:bg-paper-2"
                      >
                        <MoreVertical size={18} aria-hidden />
                      </button>

                      {menuOpen && !confirming ? (
                        <div className="absolute right-3 top-14 z-10 w-44 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
                          {openable ? (
                            <button
                              type="button"
                              onClick={() => openDocument(doc)}
                              className="block min-h-[48px] w-full px-4 text-left text-[14px] font-medium text-ink active:bg-paper-2"
                            >
                              Open
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setConfirmId(doc.documentId)}
                            className="flex min-h-[48px] w-full items-center gap-2 border-t border-line px-4 text-left text-[14px] font-medium text-stamp-red active:bg-paper-2"
                          >
                            <Trash2 size={16} aria-hidden />
                            Delete
                          </button>
                        </div>
                      ) : null}

                      {confirming ? (
                        <div className="mt-2 rounded-2xl border border-line bg-white px-4 py-3">
                          <p className="text-[14px] font-semibold text-ink">
                            Delete this document?
                          </p>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                            This removes the uploaded file, its analysis and related reminders.
                          </p>
                          <div className="mt-3 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmId(null);
                                setMenuId(null);
                              }}
                              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-[13px] font-medium text-ink-soft active:bg-paper-2"
                              disabled={busy}
                            >
                              Keep it
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument.mutate(doc.documentId)}
                              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-[13px] font-semibold text-stamp-red active:bg-tint-red"
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

      <BottomTabBar active="Documents" />
    </div>
  );
}
