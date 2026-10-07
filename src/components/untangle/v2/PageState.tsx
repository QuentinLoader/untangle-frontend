import { Link } from "@tanstack/react-router";

/** Shared recoverable states keep navigation available while a page has no data. */
export function PageState({
  title,
  body,
  loading = false,
  onRetry,
  home = false,
  retryLabel = "Try again",
}: {
  title: string;
  body: string;
  loading?: boolean;
  onRetry?: (() => void) | undefined;
  home?: boolean;
  retryLabel?: string;
}) {
  return (
    <section
      className="my-6 rounded-2xl border border-line bg-white p-5"
      role={loading ? "status" : undefined}
      aria-live="polite"
    >
      {loading ? (
        <span
          className="mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal"
          aria-hidden
        />
      ) : null}
      <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-xl text-[14px] leading-6 text-ink-soft">{body}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-[14px] font-semibold text-teal"
        >
          {retryLabel}
        </button>
      ) : null}
      {home ? (
        <Link
          to="/home"
          className="mt-3 inline-flex min-h-11 items-center px-4 text-[14px] font-semibold text-teal"
        >
          Choose a product
        </Link>
      ) : null}
    </section>
  );
}
