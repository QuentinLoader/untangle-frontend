import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function PrimaryButton({ children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`min-h-[52px] w-full rounded-[14px] bg-teal px-4 py-[14px] text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`min-h-[52px] w-full rounded-[14px] border-[1.5px] border-line bg-transparent px-4 py-[14px] text-[15px] font-semibold text-ink transition-all hover:bg-paper-2 active:scale-[0.98] active:bg-paper-2 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
