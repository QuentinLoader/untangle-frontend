import { StampBadge, type StampColor } from "./StampBadge";

export function DocCard({
  icon,
  iconBg,
  title,
  subtitle,
  stampLabel,
  stampColor = "red",
}: {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  stampLabel?: string;
  stampColor?: StampColor;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-white p-[14px]">
      <div
        className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] text-lg"
        style={{ backgroundColor: iconBg }}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-[14px] font-bold leading-snug text-ink">{title}</h3>
        <p className="mt-[3px] text-[12px] text-ink-soft">{subtitle}</p>
        {stampLabel ? (
          <div className="mt-2">
            <StampBadge label={stampLabel} color={stampColor} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
