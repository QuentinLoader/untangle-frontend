import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { AuthContext } from "../src/auth/auth-context";
import { withAuth } from "../src/auth/ProtectedRoute";
import { Route as Home } from "../src/routes/home";
import { Route as Upload } from "../src/routes/upload";
import { Route as Vault } from "../src/routes/vault";
import { Route as Policy } from "../src/routes/prototype.policycheck-v2";
import { Route as Result } from "../src/routes/result";
import { documentId, leaseResult, taxResult } from "./fixtures/results";
import type { AuthContextValue } from "../src/auth/auth.types";

const auth = {
  loading: false,
  session: { user: { id: "synthetic" } },
  user: null,
  profile: null,
} as AuthContextValue;
const plus = {
  planLabel: "Plus",
  isPlus: true,
  vaultEnabled: true,
  remindersEnabled: true,
  remainingAnalyses: null,
  unlimitedAnalyses: true,
};

async function page(
  url: string,
  options: {
    signedOut?: boolean;
    free?: boolean;
    documents?: unknown[];
    result?: unknown;
    access?: "loading" | "error";
    resultError?: boolean;
  } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false, staleTime: Infinity } },
  });
  client.setQueryData(
    ["entitlements"],
    options.free
      ? { ...plus, isPlus: false, planLabel: "Free", vaultEnabled: false, remindersEnabled: false }
      : plus,
  );
  client.setQueryData(["documents"], { data: { documents: options.documents ?? [] } });
  client.setQueryData(["reminders"], { data: { reminders: [] } });
  if (options.access === "loading") client.removeQueries({ queryKey: ["entitlements"] });
  if (options.access === "error")
    client
      .getQueryCache()
      .find({ queryKey: ["entitlements"] })
      ?.setState({ data: undefined, status: "error", error: new Error("Synthetic failure") });
  if (options.result)
    client.setQueryData(["document-result", documentId], { data: { result: options.result } });
  if (options.resultError)
    client
      .getQueryCache()
      .build(client, { queryKey: ["document-result", documentId] })
      .setState({ status: "error", error: new Error("Synthetic failure") });
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={options.signedOut ? { ...auth, session: null } : auth}>
          <Outlet />
        </AuthContext.Provider>
      </QueryClientProvider>
    ),
  });
  const path = new URL(url, "http://test.invalid").pathname;
  const route =
    path === "/home"
      ? Home
      : path === "/upload"
        ? Upload
        : path === "/vault"
          ? Vault
          : path === "/result"
            ? Result
            : Policy;
  const routes = [route.update({ id: path, path, getParentRoute: () => root })];
  const router = createRouter({
    routeTree: root.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  await router.load();
  const html = renderToString(<RouterProvider router={router} />);
  client.clear();
  return html;
}

describe("Authenticated customer pages", () => {
  test("all products stay accessible from the dashboard", async () => {
    const html = await page("/home");
    for (const name of [
      "TaxSnap",
      "LeaseCheck",
      "PolicyCheck",
      "WorkCheck",
      "AddVision",
      "No documents yet",
    ])
      expect(html).toContain(name);
  });
  test("signed-out pages do not execute protected page hooks", async () => {
    const html = await page("/home", { signedOut: true });
    expect(html).toContain("Loading");
    expect(html).not.toContain("TaxSnap");
  });
  test("authentication guard does not invoke a signed-out child component", async () => {
    let renders = 0;
    const Guarded = withAuth(function Probe() {
      renders += 1;
      return <p>Protected content</p>;
    });
    const root = createRootRoute({
      component: () => (
        <AuthContext.Provider value={{ ...auth, session: null }}>
          <Guarded />
        </AuthContext.Provider>
      ),
    });
    const router = createRouter({
      routeTree: root,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    renderToString(<RouterProvider router={router} />);
    expect(renders).toBe(0);
  });
  for (const slug of ["policycheck", "workcheck", "unknown"])
    test(`${slug} cannot fall through to generic upload`, async () => {
      const html = await page(`/upload?solution=${slug}`);
      expect(html).not.toContain("Browse files");
      expect(html).toContain("Choose a product");
    });
  test("empty saved history has a useful next step", async () => {
    const html = await page("/vault");
    expect(html).toContain("No documents yet");
    expect(html).toContain("Choose a product");
  });
  test("Free history keeps the existing Plus gate", async () => {
    const html = await page("/vault", { free: true });
    expect(html).toContain("Documents are part of Plus");
    expect(html).not.toContain("No documents yet");
  });
  test("PolicyCheck separates domain, purchased cover, gaps and evidence", async () => {
    const html = await page("/prototype/policycheck-v2");
    for (const value of [
      "Synthetic",
      "life insurance",
      "Confirmed purchased cover",
      "Described, not confirmed",
      "Not covered",
      "Not established",
      "Endorsement E-14",
      "Page 3",
      "Heads up",
      "Questions for your broker",
      "Live PolicyCheck Ask remains off",
    ])
      expect(html).toContain(value);
    expect(html).toContain("does not mean it is zero");
    expect(html).not.toContain("<textarea");
    expect(html).not.toContain("<input");
  });
  for (const access of ["loading", "error"] as const)
    test(`upload cannot start while account access is ${access}`, async () => {
      const html = await page("/upload?solution=taxsnap", { access });
      expect(html).not.toContain("Browse files");
      expect(html).toContain(access === "loading" ? "Checking your account" : "Try again");
    });
  test("TaxSnap result retains confirmed actions and dates", async () => {
    const html = await page(`/result?documentId=${documentId}&from=vault`, { result: taxResult });
    expect(html).toContain("SARS needs supporting documents");
    expect(html).toContain("Provide the listed documents");
    expect(html).toContain("30 Oct 2026");
    expect(html).toContain('href="/vault"');
  });
  test("LeaseCheck uses explicit backend financial values", async () => {
    const html = await page(`/result?documentId=${documentId}&from=vault`, { result: leaseResult });
    expect(html).toContain("LeaseCheck");
    expect(html).toMatch(/R\s+842[,\s]*236[.,]84/);
    expect(html).toMatch(/R\s+147[,\s]*475[.,]00/);
    expect(html).toContain("72 months");
  });
  test("result errors keep a retry and return route", async () => {
    const html = await page(`/result?documentId=${documentId}&from=vault`, { resultError: true });
    expect(html).toContain("Try again");
    expect(html).toContain("Back to Documents");
  });
  test("an unsupported module never displays the TaxSnap result", async () => {
    const html = await page(`/result?documentId=${documentId}&from=vault`, {
      result: { document: { module: "POLICY" } },
    });
    expect(html).toContain("This specialist result is not available yet");
    expect(html).not.toContain("TaxSnap");
  });
});
