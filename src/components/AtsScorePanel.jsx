import { ScoreGauge, CategoryBar } from '../utils/scoreUtils.jsx';

export default function AtsScorePanel({ score, onClose }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };
  return (
    <div className="ats-overlay" onClick={onClose} onKeyDown={handleKeyDown} role="dialog" aria-modal="true" aria-label="ATS Resume Score">
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
              <ScoreGauge score={score.overall} label={score.overall >= 80 ? 'Excellent' : score.overall >= 60 ? 'Good' : score.overall >= 40 ? 'Needs Work' : 'Poor'} />
              <div className="ats-meta">
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 4px' }}>
                  ATS Compatibility Score
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
