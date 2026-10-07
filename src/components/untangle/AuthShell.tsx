import type { InputHTMLAttributes, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/untangle/BrandMark";

export function AuthShell({
  title,
  subtitle,
  children,
  contextLabel,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  contextLabel?: string | undefined;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line/80 bg-paper">
        <div className="mx-auto flex min-h-[68px] max-w-[1120px] items-center px-5 sm:px-7 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark size={27} />
            <span>
              <span className="block text-[16.5px] font-semibold leading-tight text-ink">
                Untangle
              </span>
              <span className="block text-[11.5px] leading-tight text-ink-soft">South Africa</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] justify-center px-5 py-10 sm:px-7 sm:py-14 lg:px-8">
        <div className="w-full max-w-[430px]">
          {contextLabel ? (
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-teal">
              {contextLabel}
            </p>
          ) : null}

          <section className="border border-line bg-white px-5 py-6 sm:px-7 sm:py-7">
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink">
              {title}
            </h1>
            <p className="mt-2 text-[13.5px] leading-6 text-ink-soft">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </section>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-[11.5px] text-ink-soft">
            <span>Untangle South Africa is an AddVision product.</span>
            <Link to="/terms" className="font-medium text-teal">
              Terms &amp; privacy
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, error, id, ...rest }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-[12.5px] font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="mt-1.5 min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 text-[14.5px] text-ink outline-none placeholder:text-ink-soft/55 focus:border-teal focus:ring-2 focus:ring-teal/10"
      />
      {error ? <p className="mt-1.5 text-[12px] leading-5 text-stamp-red">{error}</p> : null}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border-l-2 border-stamp-red bg-tint-red/70 px-3.5 py-3 text-[12.5px] leading-5 text-stamp-red"
    >
      {message}
    </div>
  );
}

export function FormNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="border-l-2 border-teal bg-teal-dim/70 px-3.5 py-3 text-[12.5px] leading-5 text-teal"
    >
      {message}
    </div>
  );
}
