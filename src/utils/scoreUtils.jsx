export function catColor(pct) {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#eab308';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

export function ScoreGauge({ score, label }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score || 0, 0), 100);
  const offset = circumference - (pct / 100) * circumference;
  const color = catColor(pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width="130" height="130" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="60" y="56" textAnchor="middle" fontSize="28" fontWeight="700" fill="#111827">{pct}</text>
        <text x="60" y="74" textAnchor="middle" fontSize="11" fill="#94a3b8">/ 100</text>
      </svg>
      {label && <span style={{ fontSize: '13px', fontWeight: 600, color }}>{label}</span>}
    </div>
  );
}

export function CategoryBar({ name, pct }) {
  const color = catColor(pct);
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
        <span style={{ fontWeight: 600, color: '#374151' }}>{name}</span>
        <span style={{ color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
