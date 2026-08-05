import { supabase } from "./supabase";
import type { AuthMeResponse, UntangleUser } from "@/auth/auth.types";

const API_BASE_URL = (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  status: number;
  code: string | undefined;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function buildHeaders(extra?: HeadersInit): Promise<Headers> {
  const headers = new Headers(extra);
  headers.set("Content-Type", "application/json");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status}).`;
  let code: string | undefined;
  try {
    const body = (await response.json()) as { message?: string; error?: string; code?: string };
    message = body.message ?? body.error ?? message;
    code = body.code;
  } catch {
    /* non-JSON error body */
  }
  return new ApiError(message, response.status, code);
}

/** Authenticated request against the Untangle backend. */
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new ApiError("API base URL is not configured.", 0);

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const send = async () =>
    fetch(url, { ...options, headers: await buildHeaders(options.headers) });

  let response: Response;
  try {
    response = await send();
  } catch {
    throw new ApiError("We could not connect. Check your connection and try again.", 0);
  }

  if (response.status === 401) {
    // Refresh the Supabase session once, then retry once.
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      try {
        response = await send();
      } catch {
        throw new ApiError("We could not connect. Check your connection and try again.", 0);
      }
    }
    if (response.status === 401) {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        window.location.assign(
          `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
      }
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Loads the Untangle application profile for the signed-in user. */
export async function fetchAuthMe(): Promise<UntangleUser> {
  const result = await apiRequest<AuthMeResponse>("/api/v1/auth/me");
  return result.data.user;
}
