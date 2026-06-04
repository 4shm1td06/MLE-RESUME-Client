import React from 'react';

function catColor(pct) {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#eab308';
  if (pct >= 40) return '#f97316';
  return '#ef4444';
}

export default function JdMatchCard({ result, loading, error, jobDescription, onReadMore }) {
  if (error) {
    return (
      <div className="jd-card">
        <div className="jd-card-header">
          <h3>JD Match</h3>
        </div>
        <p className="jd-card-error">Match unavailable</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="jd-card">
        <div className="jd-card-header">
          <h3>JD Match</h3>
        </div>
        <div className="jd-card-loading">
          <div className="jd-spinner" />
          <span>Analyzing match...</span>
        </div>
      </div>
    );
  }

  if (!result || !jobDescription) {
    return (
      <div className="jd-card">
        <div className="jd-card-header">
          <h3>JD Match</h3>
        </div>
        <p className="jd-card-empty">Paste a job description and click "JD Match" to evaluate alignment.</p>
      </div>
    );
  }

  const categories = Object.entries(result.categories || {});
  const matched = (result.matchedSkills || []).slice(0, 8);
  const missing = (result.missingSkills || []).slice(0, 8);

  return (
    <div className="jd-card">
      <div className="jd-card-header">
        <h3>JD Match</h3>
        <span className="jd-card-badge" style={{ color: catColor(result.overall) }}>
          {result.overall}<small>%</small>
        </span>
      </div>

      <div className="jd-card-provider">
        {result.provider === 'openrouter' ? 'AI Analysis' : 'Keyword-based'}
      </div>

      {categories.length > 0 && (
        <div className="jd-card-categories">
          {categories.slice(0, 4).map(([name, cat]) => (
            <div key={name} className="jd-card-cat">
              <span className="jd-card-cat-name">{name}</span>
              <span className="jd-card-cat-bar-wrap">
                <span
                  className="jd-card-cat-bar"
                  style={{
                    width: `${cat.pct}%`,
                    background: catColor(cat.pct)
                  }}
                />
              </span>
              <span className="jd-card-cat-pct" style={{ color: catColor(cat.pct) }}>
                {cat.pct}%
              </span>
            </div>
          ))}
        </div>
      )}

      {matched.length > 0 && (
        <div className="jd-card-section">
          <div className="jd-card-section-title matched">Matched Skills</div>
          <div className="jd-skill-tags">
            {matched.map((s, i) => (
              <span key={i} className="jd-skill-tag matched">{s}</span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="jd-card-section">
          <div className="jd-card-section-title missing">Missing Skills</div>
          <div className="jd-skill-tags">
            {missing.map((s, i) => (
              <span key={i} className="jd-skill-tag missing">{s}</span>
            ))}
          </div>
        </div>
      )}

      {onReadMore && (
        <button type="button" className="btn btn-ghost btn-sm jd-card-more" onClick={onReadMore}>
          Full Analysis →
        </button>
      )}
    </div>
  );
}
