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
        {pct >= 80 ? 'Strong Match' : pct >= 60 ? 'Good Match' : pct >= 40 ? 'Partial Match' : 'Weak Match'}
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

export default function JdMatchPanel({ result, onClose }) {
  return (
    <div className="jd-overlay" onClick={onClose}>
      <div className="jd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="jd-header">
          <h2>JD Match Analysis</h2>
          <button className="jd-close" onClick={onClose}>Close</button>
        </div>

        {!result && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ color: '#64748b' }}>
              Paste a job description and run JD Match to see the analysis.
            </p>
          </div>
        )}

        {result && (
          <>
            <div className="jd-gauge-wrap">
              <ScoreGauge score={result.overall} />
              <div className="jd-meta">
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 4px' }}>
                  Powered by {result.provider === 'openrouter' ? 'AI' : 'keyword-based analysis'}
                </p>
                {result.meta && (
                  <div className="jd-meta-grid">
                    <span>JD Keywords: <strong>{result.meta.jdWordCount ?? '—'}</strong></span>
                    <span>Resume tokens: <strong>{result.meta.resumeWordCount ?? '—'}</strong></span>
                    <span>Keyword overlap: <strong>{result.meta.keywordOverlap ?? '—'}%</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="jd-categories">
              <h3 className="jd-section-title">Category Breakdown</h3>
              {Object.entries(result.categories || {}).map(([name, cat]) => (
                <CategoryBar key={name} name={name} pct={cat?.pct ?? 0} />
              ))}
            </div>

            {(result.matchedSkills || []).length > 0 && (
              <div className="jd-section">
                <h3 className="jd-section-title">Matched Skills</h3>
                <div className="jd-skill-tags" style={{ marginTop: '8px' }}>
                  {result.matchedSkills.map((s, i) => (
                    <span key={i} className="jd-skill-tag matched">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {(result.missingSkills || []).length > 0 && (
              <div className="jd-section">
                <h3 className="jd-section-title">Missing Skills</h3>
                <div className="jd-skill-tags" style={{ marginTop: '8px' }}>
                  {result.missingSkills.map((s, i) => (
                    <span key={i} className="jd-skill-tag missing">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {(result.recommendations || []).length > 0 && (
              <div className="jd-pros-cons">
                <div>
                  <h4 className="jd-list-title recs">Recommendations</h4>
                  <ul className="jd-list">
                    {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
