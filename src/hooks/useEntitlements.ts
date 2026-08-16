import { useQuery } from "@tanstack/react-query";
import { fetchEntitlements, type Entitlements } from "@/lib/entitlements";

export const ENTITLEMENTS_QUERY_KEY = ["entitlements"] as const;

/** Shared plan state — one query, one source of truth (the Railway backend). */
export function useEntitlements() {
  const query = useQuery<Entitlements>({
    queryKey: ENTITLEMENTS_QUERY_KEY,
    queryFn: fetchEntitlements,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  return {
    entitlements: query.data ?? null,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
