/**
 * Origin-aware back navigation for the Result screen: the back button returns
 * to the screen the user actually came from, not a hardcoded upload screen.
 */
export type ResultOrigin = "home" | "vault" | "reminders" | "upload";

const ORIGINS: ResultOrigin[] = ["home", "vault", "reminders", "upload"];

export function parseResultOrigin(value: unknown): ResultOrigin {
  return typeof value === "string" && (ORIGINS as string[]).includes(value)
    ? (value as ResultOrigin)
    : "vault";
}

const BACK_TARGETS: Record<ResultOrigin, { to: string; label: string }> = {
  home: { to: "/home", label: "Home" },
  vault: { to: "/vault", label: "Documents" },
  reminders: { to: "/reminders", label: "Reminders" },
  upload: { to: "/upload", label: "Upload" },
};

export function resultBackTarget(origin: ResultOrigin) {
  return BACK_TARGETS[origin];
}
