import React from 'react';

function ScoreGauge({ score }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score || 0, 0), 100);
  const offset = circumference - (pct / 100) * circumference;

  let color;
  if (pct >= 80) color = '#22c55e';
  else if (pct >= 60) color = '#eab308';
  else if (pct >= 40) color = '#f97316';
  else color = '#ef4444';

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
      <span style={{ fontSize: '13px', fontWeight: 600, color }}>
        {pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Needs Work' : 'Poor'}
      </span>
    </div>
  );
}

function CategoryBar({ name, pct }) {
  let color;
  if (pct >= 80) color = '#22c55e';
  else if (pct >= 60) color = '#eab308';
  else if (pct >= 40) color = '#f97316';
  else color = '#ef4444';

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

export default function AtsScorePanel({ score, onClose }) {
  return (
    <div className="ats-overlay" onClick={onClose}>
      <div className="ats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ats-header">
          <h2>ATS Resume Score</h2>
          <button className="ats-close" onClick={onClose}>Close</button>
        </div>

        {!score && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ color: '#64748b' }}>
              Parse a resume to see the ATS score.
            </p>
          </div>
        )}

        {score && (
          <>
            <div className="ats-gauge-wrap">
              <ScoreGauge score={score.overall} />
              <div className="ats-meta">
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 4px' }}>
                  Powered by {score.provider === 'openrouter' ? 'AI' : 'rule-based analysis'}
                </p>
                {score.meta && (
                  <div className="ats-meta-grid">
                    <span>Words: <strong>{score.meta.wordCount ?? '—'}</strong></span>
                    <span>Read time: <strong>{score.meta.estimatedReadMinutes ?? '—'} min</strong></span>
                    <span>Skills: <strong>{score.meta.skillCount ?? '—'}</strong></span>
                    <span>Roles: <strong>{score.meta.workHistoryCount ?? '—'}</strong></span>
                    <span>Contributions: <strong>{score.meta.contributionCount ?? '—'}</strong></span>
                    <span>Certifications: <strong>{score.meta.certificationCount ?? '—'}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="ats-categories">
              <h3 className="ats-section-title">Category Breakdown</h3>
              {Object.entries(score.categories || {}).map(([name, cat]) => (
                <CategoryBar key={name} name={name} pct={cat?.pct ?? 0} />
              ))}
            </div>

            <div className="ats-pros-cons">
              <div>
                <h4 className="ats-list-title pros">Pros</h4>
                <ul className="ats-list">
                  {(score.pros || []).length > 0
                    ? score.pros.map((p, i) => <li key={i}>{p}</li>)
                    : <li style={{ color: '#94a3b8' }}>No pros identified</li>}
                </ul>
              </div>
              <div>
                <h4 className="ats-list-title cons">Cons / Improvements</h4>
                <ul className="ats-list">
                  {(score.cons || []).length > 0
                    ? score.cons.map((c, i) => <li key={i}>{c}</li>)
                    : <li style={{ color: '#94a3b8' }}>No issues found</li>}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
