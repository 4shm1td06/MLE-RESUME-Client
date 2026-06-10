import { ScoreGauge, CategoryBar } from '../utils/scoreUtils.jsx';

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
              <ScoreGauge score={result.overall} label={result.overall >= 80 ? 'Strong Match' : result.overall >= 60 ? 'Good Match' : result.overall >= 40 ? 'Partial Match' : 'Weak Match'} />
              <div className="jd-meta">
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 4px' }}>
                  JD Match Analysis
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
