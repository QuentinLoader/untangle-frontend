import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PortfolioBrand } from "./PortfolioBrand";
import { ResultSidebar } from "./ResultSidebar";
import { ResultContextRail } from "./ResultContextRail";
import type { WorkspaceNavItem } from "./ResultWorkspace";
import "./prototype.css";

/** Opt-in layout: production consumers of ResultWorkspace are unchanged. */
export function PrototypeWorkspace({
  children,
  context,
  navItems,
}: {
  children: ReactNode;
  context: ReactNode;
  navItems: WorkspaceNavItem[];
}) {
  return (
    <div className="leasecheck-prototype">
      <a href="#summary" className="v2-skip-link">
        Skip to the report
      </a>
      <header className="v2-prototype-header">
        <div>
          <Link to="/home" aria-label="Back to Home" className="v2-back">
            <ArrowLeft size={20} aria-hidden />
          </Link>
          <PortfolioBrand productName="LeaseCheck" />
          <span className="v2-demo-label">Synthetic demo</span>
        </div>
      </header>
      <div className="v2-prototype-grid">
        <ResultSidebar items={navItems} />
        <main className="v2-prototype-report">{children}</main>
        <ResultContextRail>{context}</ResultContextRail>
      </div>
      <footer className="v2-prototype-footer">
        Untangle South Africa is an AddVision product. This prototype uses synthetic demonstration
        information.
      </footer>
    </div>
  );
}
