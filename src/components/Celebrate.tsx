import { useEffect } from "react";

const COLORS = ["#F2C94C", "#2B5BA9", "#3E7C5A", "#8A2D5B", "#8FB3E8"];

/** Confetti burst plus a toast. Remount with a new id to replay. Confetti is skipped for reduced-motion users. */
export default function Celebrate({ id, text, onDone }: { id: number; text: string; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(t);
  }, [id, onDone]);
  const calm = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <>
      {!calm && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 36 }, (_, i) => (
            <i
              key={i}
              style={{ left: `${(i * 97) % 100}%`, background: COLORS[i % COLORS.length], animationDelay: `${(i % 9) * 0.06}s`, ["--dx" as string]: `${((i * 37) % 160) - 80}px`, transform: `rotate(${i * 25}deg)` }}
            />
          ))}
        </div>
      )}
      <div className="toast" role="status">{text}</div>
    </>
  );
}
