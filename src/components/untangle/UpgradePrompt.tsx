import { Link } from "@tanstack/react-router";
import { BlockCard } from "./BlockCard";

export function UpgradePrompt({
  title = "Part of Untangle Plus",
  message,
  cta = "See Untangle Plus",
}: {
  title?: string;
  message: string;
  cta?: string;
}) {
  return (
    <BlockCard title={title}>
      <p className="text-[13px] text-ink-soft">{message}</p>
      <Link
        to="/upgrade"
        className="mt-3 block w-full rounded-[14px] bg-teal px-4 py-[13px] text-center text-[15px] font-semibold text-white"
      >
        {cta}
      </Link>
    </BlockCard>
  );
}
