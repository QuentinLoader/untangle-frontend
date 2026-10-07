import type { WorkspaceNavItem } from "./ResultWorkspace";

export function ResultSidebar({ items }: { items: WorkspaceNavItem[] }) {
  return (
    <>
      <nav className="v2-result-sidebar" aria-label="Result sections">
        <p>In this report</p>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="v2-mobile-sections">
        <label htmlFor="leasecheck-section">Go to a section</label>
        <select
          id="leasecheck-section"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) window.location.hash = event.target.value;
          }}
        >
          <option value="" disabled>
            Choose a section
          </option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
