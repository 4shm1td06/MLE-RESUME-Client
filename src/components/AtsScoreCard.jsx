import React from 'react';

function catColor(pct) {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#eab308';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

export default function AtsScoreCard({ score, loading, error, onReadMore }) {
  if (error) {
    return (
      <div className="ats-card">
        <div className="ats-card-header">
          <h3>ATS Score</h3>
        </div>
        <p className="ats-card-error">Score unavailable</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ats-card">
        <div className="ats-card-header">
          <h3>ATS Score</h3>
        </div>
        <div className="ats-card-loading">
          <div className="ats-spinner" />
          <span>Analyzing resume...</span>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="ats-card">
        <div className="ats-card-header">
          <h3>ATS Score</h3>
        </div>
        <p className="ats-card-empty">Upload and parse a resume to see the ATS score.</p>
      </div>
    );
  }

  const categories = Object.entries(score.categories || {});
  const pros = (score.pros || []).slice(0, 3);
  const cons = (score.cons || []).slice(0, 3);

  return (
    <div className="ats-card">
      <div className="ats-card-header">
        <h3>ATS Score</h3>
        <span className="ats-card-badge" style={{ color: catColor(score.overall) }}>
          {score.overall}<small>/100</small>
        </span>
      </div>

      <div className="ats-card-provider">
        {score.provider === 'openrouter' ? 'AI Analysis' : 'Rule-based'}
      </div>

      {categories.length > 0 && (
        <div className="ats-card-categories">
          {categories.slice(0, 6).map(([name, cat]) => (
            <div key={name} className="ats-card-cat">
              <span className="ats-card-cat-name">{name}</span>
              <span className="ats-card-cat-bar-wrap">
                <span
                  className="ats-card-cat-bar"
                  style={{
                    width: `${cat.pct}%`,
                    background: catColor(cat.pct)
                  }}
                />
              </span>
              <span className="ats-card-cat-pct" style={{ color: catColor(cat.pct) }}>
                {cat.pct}%
              </span>
            </div>
          ))}
        </div>
      )}

      {pros.length > 0 && (
        <div className="ats-card-section">
          <div className="ats-card-section-title pros">Pros</div>
          <ul className="ats-card-list">
            {pros.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {cons.length > 0 && (
        <div className="ats-card-section">
          <div className="ats-card-section-title cons">Cons</div>
          <ul className="ats-card-list">
            {cons.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {onReadMore && (
        <button type="button" className="btn btn-ghost btn-sm ats-card-more" onClick={onReadMore}>
          Read More →
        </button>
      )}
    </div>
  );
}
