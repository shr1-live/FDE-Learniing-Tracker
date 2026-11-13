export default function Ring({ pct, size = 132 }: { pct: number; size?: number }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${pct} percent complete`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--hl)" />
            <stop offset="1" stopColor="var(--moss)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} className="rtrack" />
        <circle cx={size / 2} cy={size / 2} r={r} className="rbar" stroke="url(#rg)" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <b>{pct}<small>%</small></b>
    </div>
  );
}
