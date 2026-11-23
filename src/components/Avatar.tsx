/** Initials on a round tint from the brand's avatar palette (periwinkle, butter, mint, lavender). Decorative: the name is always written next to it. */
const tone = (name: string) => [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 4, 1);
const initials = (name: string) => (name || "?").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((x) => x[0]!.toUpperCase()).join("") || "?";

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return <span className={`avatar ${size} av${tone(name)}`} aria-hidden="true">{initials(name)}</span>;
}
