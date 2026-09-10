/** Untangle leaf mark. Pure SVG so it scales cleanly at any size. */
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Untangle"
      className="shrink-0"
    >
      <path
        d="M24 3C13 11 7 19 7 28a17 17 0 0 0 17 17V3Z"
        fill="var(--teal)"
        opacity="0.92"
      />
      <path d="M24 3c11 8 17 16 17 25a17 17 0 0 1-17 17V3Z" fill="var(--teal)" opacity="0.55" />
      <path
        d="M24 45V9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
        fill="none"
      />
    </svg>
  );
}
