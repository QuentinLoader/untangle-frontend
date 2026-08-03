import { Link } from "@tanstack/react-router";

export function FAB() {
  return (
    <Link
      to="/upload"
      className="fixed bottom-[86px] right-4 z-40 inline-flex items-center rounded-full bg-teal px-5 py-[14px] text-[14px] font-semibold text-white"
      style={{ boxShadow: "0 10px 22px -8px var(--teal)" }}
    >
      ＋ Upload
    </Link>
  );
}
