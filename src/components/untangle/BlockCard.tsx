import type { ReactNode } from "react";

export function BlockCard({
  title,
  children,
  action,
  className = "",
}: {
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[14px] border border-line bg-white p-[14px] ${className}`}>
      {(title || action) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          {title ? (
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-teal">
              {title}
            </span>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
