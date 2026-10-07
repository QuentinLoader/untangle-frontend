import type { ReactNode } from "react";

export function ResultContextRail({ children }: { children: ReactNode }) {
  return (
    <aside className="v2-result-context" aria-label="Document context">
      {children}
    </aside>
  );
}
