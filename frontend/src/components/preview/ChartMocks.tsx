/** Reusable SVG chart mocks for dashboard previews. */

export function MiniLine({ color = '#0066cc' }: { color?: string }) {
  const pts = [8, 22, 14, 28, 18, 32, 28];
  const w = 80, h = 36;
  const max = Math.max(...pts);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * w},${h - (p / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="32" preserveAspectRatio="none">
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={color} opacity="0.08" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MiniBar({ color = '#0066cc' }: { color?: string }) {
  const bars = [12, 24, 16, 30, 20, 28, 14];
  const w = 80, h = 36, max = Math.max(...bars), bw = (w / bars.length) - 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="32" preserveAspectRatio="none">
      {bars.map((v, i) => (
        <rect key={i} x={i * (bw + 2) + 1} y={h - (v / max) * h} width={bw} height={(v / max) * h} fill={color} opacity="0.7" rx="1" />
      ))}
    </svg>
  );
}
