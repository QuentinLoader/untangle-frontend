import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function PrimaryButton({ children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`w-full rounded-[14px] bg-teal px-4 py-[14px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`w-full rounded-[14px] border-[1.5px] border-line bg-transparent px-4 py-[14px] text-[15px] font-semibold text-ink transition-colors hover:bg-paper-2 ${className}`}
    >
      {children}
    </button>
  );
}
