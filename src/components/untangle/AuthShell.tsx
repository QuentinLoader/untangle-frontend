import type { InputHTMLAttributes, ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper px-5 py-10">
      <div className="mx-auto w-full max-w-[380px]">
        <div className="flex items-center gap-2">
          <span className="h-[9px] w-[9px] rounded-full bg-teal" aria-hidden />
          <span className="font-display text-[19px] font-semibold text-ink">Untangle</span>
        </div>
        <h1 className="mt-8 font-display text-[24px] font-semibold leading-snug text-ink">
          {title}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, error, id, ...rest }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft"
      >
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="mt-1.5 w-full rounded-[14px] border border-line bg-white px-4 py-[13px] text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:border-teal"
      />
      {error ? <p className="mt-1.5 text-[12px] text-stamp-red">{error}</p> : null}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-[14px] border border-stamp-red/30 bg-tint-red px-4 py-3 text-[13px] text-stamp-red"
    >
      {message}
    </div>
  );
}

export function FormNotice({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-[14px] border border-teal/25 bg-teal-dim px-4 py-3 text-[13px] text-teal"
    >
      {message}
    </div>
  );
}
