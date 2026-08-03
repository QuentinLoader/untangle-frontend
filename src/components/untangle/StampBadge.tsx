export type StampColor = "red" | "teal" | "amber";

const COLORS: Record<StampColor, string> = {
  red: "var(--stamp-red)",
  teal: "var(--teal)",
  amber: "var(--stamp-amber)",
};

export function StampBadge({
  label,
  color = "red",
  className = "",
}: {
  label: string;
  color?: StampColor;
  className?: string;
}) {
  const c = COLORS[color] ?? color;
  return (
    <span
      className={`inline-block rotate-[-4deg] rounded-[6px] border-2 bg-transparent px-2 py-[3px] font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] ${className}`}
      style={{ borderColor: c, color: c }}
    >
      {label}
    </span>
  );
}
