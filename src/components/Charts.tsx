import { formatShort } from '../utils/date';

export interface Point {
  date: string;
  value: number;
}

/** Small line chart with a soft gradient fill, sized to its container. */
export function LineChart({ points, unit = '', color = '#f286b3' }: { points: Point[]; unit?: string; color?: string }) {
  if (points.length === 0) {
    return <div className="chart-empty">No data yet. Log a few sessions and your progress line will appear here.</div>;
  }
  if (points.length === 1) {
    return (
      <div className="chart-empty">
        One entry so far: <strong style={{ marginLeft: 4 }}>{points[0].value}{unit}</strong>. Log another to see the trend.
      </div>
    );
  }

  const w = 320;
  const h = 140;
  const pad = { top: 14, right: 10, bottom: 22, left: 30 };
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.max(1, max * 0.1);
  const lo = min - span * 0.2;
  const hi = max + span * 0.2;

  const x = (i: number) => pad.left + (i / (points.length - 1)) * (w - pad.left - pad.right);
  const y = (v: number) => pad.top + (1 - (v - lo) / (hi - lo)) * (h - pad.top - pad.bottom);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${h - pad.bottom} L${x(0).toFixed(1)},${h - pad.bottom} Z`;
  const gid = `grad-${color.replace('#', '')}`;

  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Progress chart">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad.left} x2={w - pad.right} y1={pad.top + t * (h - pad.top - pad.bottom)} y2={pad.top + t * (h - pad.top - pad.bottom)} stroke="#f6e2ec" strokeWidth="1" />
      ))}
      <text x={4} y={pad.top + 4} fontSize="9" fill="#a2919b">{Math.round(hi)}</text>
      <text x={4} y={h - pad.bottom} fontSize="9" fill="#a2919b">{Math.round(lo)}</text>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {points.map((p, i) => (
        <circle key={p.date + i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4 : 2.6} fill="#fff" stroke={color} strokeWidth="2" />
      ))}
      <text x={pad.left} y={h - 6} fontSize="9" fill="#a2919b">{formatShort(points[0].date)}</text>
      <text x={w - pad.right} y={h - 6} fontSize="9" fill="#a2919b" textAnchor="end">{formatShort(points[points.length - 1].date)}</text>
    </svg>
  );
}

/** Weekly bar chart, e.g. total volume per week. */
export function BarChart({ bars, color = '#f9a8c9' }: { bars: { label: string; value: number }[]; color?: string }) {
  if (bars.length === 0 || bars.every((b) => b.value === 0)) {
    return <div className="chart-empty">Nothing logged yet this period.</div>;
  }
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div className="row" style={{ alignItems: 'flex-end', gap: 8, height: 130 }}>
      {bars.map((b) => (
        <div key={b.label} className="grow" style={{ textAlign: 'center' }}>
          <div style={{ height: 96, display: 'flex', alignItems: 'flex-end' }}>
            <div
              style={{
                width: '100%',
                height: `${Math.max(4, (b.value / max) * 96)}px`,
                background: b.value > 0 ? color : '#f6e2ec',
                borderRadius: 8,
                transition: 'height 0.4s ease',
              }}
              title={`${b.value}`}
            />
          </div>
          <div className="tiny faint" style={{ marginTop: 6 }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ProgressRing({ value, max, label, sublabel }: { value: number; max: number; label?: string; sublabel?: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap">
      <svg width="74" height="74" viewBox="0 0 74 74">
        <circle cx="37" cy="37" r={r} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="7" />
        <circle
          cx="37" cy="37" r={r}
          fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 37 37)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="ring-label" style={{ color: '#fff' }}>
        <span>{label ?? `${value}/${max}`}</span>
        {sublabel && <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.85 }}>{sublabel}</span>}
      </div>
    </div>
  );
}
