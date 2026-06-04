import { useMemo, useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './config.js';
import { defaultResume } from './lib/defaultResume.js';
import { ArrayEditor } from './components/ArrayEditor.jsx';
import { WorkHistoryEditor } from './components/WorkHistoryEditor.jsx';
import { SkillGroupsEditor } from './components/SkillGroupsEditor.jsx';
import { TechnicalExperienceEditor } from './components/TechnicalExperienceEditor.jsx';
import { ProjectsEditor } from './components/ProjectsEditor.jsx';
import { AdditionalSectionsEditor } from './components/AdditionalSectionsEditor.jsx';
import { ResumePreview } from './components/ResumePreview.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import AtsScorePanel from './components/AtsScorePanel.jsx';
import AtsScoreCard from './components/AtsScoreCard.jsx';
import JdMatchPanel from './components/JdMatchPanel.jsx';
import JdMatchCard from './components/JdMatchCard.jsx';

function Section({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="form-section">
      <button
        type="button"
        className={`form-section-toggle${open ? '' : ' collapsed'}`}
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span className="collapse-icon">▼</span>
      </button>
      <div className={`form-section-content${open ? '' : ' collapsed'}`}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [resumeData, setResumeData] = useState({ ...defaultResume, maskPersonalDetails: true });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [docxUrl, setDocxUrl] = useState('');
  const [message, setMessage] = useState('Upload a PDF or DOCX resume to convert it into a stronger MLE-style profile and export PDF or DOCX.');
  const [meta, setMeta] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [showAts, setShowAts] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jdResult, setJdResult] = useState(null);
  const [jdLoading, setJdLoading] = useState(false);
  const [jdError, setJdError] = useState(null);
  const [showJd, setShowJd] = useState(false);

  const parseAbortRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    if (parseAbortRef.current) parseAbortRef.current.abort();
    const controller = new AbortController();
    parseAbortRef.current = controller;
    handleParse(file, controller.signal);
  }, [file]);

  const initialsSuggestion = useMemo(() => {
    if (resumeData.candidateInitials?.trim()) return resumeData.candidateInitials.trim();
    return (resumeData.candidateName || '').split(/\s+/).filter(Boolean).map((part) => part[0]?.toUpperCase()).slice(0, 3).join('');
  }, [resumeData.candidateInitials, resumeData.candidateName]);

  const update = (key, value) => setResumeData((prev) => ({ ...prev, [key]: value }));
  const buildPayload = () => ({ ...resumeData, candidateInitials: resumeData.candidateInitials?.trim() || initialsSuggestion });
  const payload = useMemo(buildPayload, [resumeData, initialsSuggestion]);

  const isError = message.toLowerCase().includes('fail') || message.toLowerCase().includes('went wrong') || message.toLowerCase().includes('error');
  const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('parsed');
  const statusClass = loading ? 'loading' : isError ? 'error' : isSuccess ? 'success' : '';

  const handleParse = async (fileToParse, signal) => {
    if (!fileToParse) return;
    const formData = new FormData();
    formData.append('resume', fileToParse);
    setLoading(true);
    setPdfUrl('');
    setDocxUrl('');
    setMeta(null);
    setAtsScore(null);
    setAtsError(null);
    setJdResult(null);
    setJdError(null);
    let newExtractedText = '';
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/parse`, { method: 'POST', body: formData, signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Resume parsing failed.');
      const newData = { ...resumeData, ...result.parsedData, maskPersonalDetails: typeof result.parsedData?.maskPersonalDetails === 'boolean' ? result.parsedData.maskPersonalDetails : resumeData.maskPersonalDetails };
      newExtractedText = result.extractedText || '';
      setResumeData(newData);
      setExtractedText(newExtractedText);
      setMeta(result.meta || null);
      setMessage(result.message || 'Resume parsed successfully. Review the data and export the final file.');

      const newPayload = { ...newData, candidateInitials: (newData.candidateInitials || '').trim() || (newData.candidateName || '').split(/\s+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).slice(0, 3).join('') };
      setAtsLoading(true);
      try {
        const atsResp = await fetch(`${API_BASE_URL}/api/resumes/ats-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeData: newPayload, rawText: newExtractedText })
        });
        const atsResult = await atsResp.json();
        if (!atsResp.ok) throw new Error(atsResult.error || 'ATS scoring failed');
        setAtsScore(atsResult);
      } catch (atsErr) {
        if (atsErr.name === 'AbortError') return;
        setAtsError(atsErr.message);
      } finally {
        setAtsLoading(false);
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      setMessage(error.message || 'Something went wrong while parsing the resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleParseButton = () => {
    if (!file) {
      setMessage('Please choose a PDF or DOCX resume first.');
      return;
    }
    if (parseAbortRef.current) parseAbortRef.current.abort();
    const controller = new AbortController();
    parseAbortRef.current = controller;
    handleParse(file, controller.signal);
  };

  const handleJdMatch = async () => {
    if (!jobDescription.trim()) {
      setMessage('Please paste a job description first.');
      return;
    }
    setJdLoading(true);
    setJdError(null);
    setJdResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/jd-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: buildPayload(), rawText: extractedText, jobDescription })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'JD Match failed.');
      setJdResult(result);
      setMessage('JD match analysis complete.');
    } catch (error) {
      setJdError(error.message);
      setMessage(error.message || 'Something went wrong during JD match.');
    } finally {
      setJdLoading(false);
    }
  };

  const handleGrammarFix = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/grammar-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: buildPayload() })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Grammar fix failed.');
      setResumeData((prev) => ({ ...prev, ...result.fixedData }));
      setMessage(result.message || 'Grammar fixed successfully.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong while fixing grammar.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (format) => {
    setLoading(true);
    setPdfUrl('');
    setDocxUrl('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/generate-${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `${format.toUpperCase()} generation failed.`);
      if (format === 'pdf') {
        setPdfUrl(result.pdfUrl);
        setMessage('PDF generated successfully.');
      } else {
        setDocxUrl(result.docxUrl);
        setMessage('DOCX generated successfully.');
      }
    } catch (error) {
      setMessage(error.message || `Something went wrong while generating the ${format.toUpperCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const retryLastAction = useMemo(() => {
    if (!message || loading) return null;
    if (isError && file) return () => handleParseButton();
    return null;
  }, [message, loading, file]);

  const inputFields = [
    ['Candidate Name', 'candidateName', 'Enter candidate name'],
    ['Candidate Initials', 'candidateInitials', 'Auto-generated initials'],
    ['Title', 'title', 'e.g. SAP Finance Consultant'],
    ['Phone', 'phone', 'Phone number'],
    ['Email', 'email', 'Email address'],
    ['Location', 'location', 'City, State'],
    ['LinkedIn', 'linkedin', 'LinkedIn URL'],
    ['Total Experience', 'totalExperience', 'e.g. 7+ Years'],
    ['Current Company', 'currentCompany', 'Current employer'],
    ['Current Designation', 'currentDesignation', 'Current title'],
    ['Notice Period', 'noticePeriod', 'e.g. 30 days'],
    ['Current CTC', 'currentCtc', 'Current compensation'],
    ['Expected CTC', 'expectedCtc', 'Expected compensation'],
    ['Highest Qualification', 'highestQualification', 'Highest degree']
  ];

  return (
    <div className="app-shell">
      <header className="hero-card card">
        <div className="hero-copy">
          <p className="eyebrow">MLE SYSTEMS</p>
          <h1>Recruiter Resume Formatter</h1>
          <p className="subtext">Upload a resume, structure it into the MLE format, enrich the candidate profile, and export a recruiter-ready PDF or DOCX.</p>
        </div>
        <div className="hero-badge-panel">
          <div className="hero-badge"><span className="hero-badge-label">Format</span><strong>MLE PDF / DOCX</strong></div>
          <div className="hero-badge"><span className="hero-badge-label">Input</span><strong>PDF / DOCX</strong></div>
        </div>
      </header>

      <section className="toolbar card">
        <div className="upload-block">
          <label className="upload-label">Resume File</label>
          <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <p className="helper-text">Supported formats: PDF and DOCX{file ? ` • Selected: ${file.name}` : ''}</p>
        </div>
        <div className="toolbar-actions">
          <button type="button" onClick={handleParseButton} disabled={loading} className="btn btn-primary">{loading ? 'Processing…' : 'Parse Resume'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleGenerate('pdf')} disabled={loading}>Generate PDF</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleGenerate('docx')} disabled={loading}>Generate DOCX</button>
          <button type="button" className="btn btn-secondary" onClick={handleGrammarFix} disabled={loading || (!resumeData.candidateName && !resumeData.candidateInitials)}>Grammar Fix</button>
          {pdfUrl ? <a className="btn btn-link" href={`${API_BASE_URL}${pdfUrl}`} target="_blank" rel="noreferrer">Open PDF</a> : null}
          {docxUrl ? <a className="btn btn-link" href={docxUrl} target="_blank" rel="noreferrer">Open DOCX</a> : null}
        </div>
      </section>

      <section className="toolbar card" style={{ marginTop: '8px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="upload-label">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => { setJobDescription(e.target.value); setJdResult(null); setJdError(null); }}
            placeholder="Paste the job description here to compare against the parsed resume..."
            rows={3}
            style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
          />
        </div>
        <div className="toolbar-actions" style={{ alignSelf: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={handleJdMatch} disabled={jdLoading || !jobDescription.trim()}>{jdLoading ? 'Analyzing…' : 'JD Match'}</button>
        </div>
      </section>

      <section className={`status-card card${statusClass ? ' ' + statusClass : ''}`}>
        <div className="status-top">
          <h3>Status</h3>
          <span className={`status-dot ${loading ? 'loading' : statusClass === 'error' ? 'error' : 'idle'}`} />
        </div>
        <p className="status-text">{message}</p>
        {retryLastAction ? <button type="button" className="btn btn-ghost" onClick={retryLastAction} style={{ marginTop: '8px' }}>Retry</button> : null}
        {meta ? <div className="meta-pill-row">
          <span className="meta-pill">API used: {meta.apiUsed ? 'Yes' : 'No'}</span>
          <span className="meta-pill">Fallback used: {meta.fallbackUsed ? 'Yes' : 'No'}</span>
          {meta.model ? <span className="meta-pill">Model: {meta.model}</span> : null}
          {meta.reason ? <span className="meta-pill subtle">{meta.reason}</span> : null}
        </div> : null}
      </section>

      <div className="layout-grid">
        <section className="card form-card">
          <div className="card-header">
            <div>
              <h2>Editable Resume Data</h2>
              <p>Refine extracted content before exporting the final MLE profile.</p>
            </div>
          </div>

          <Section title="Personal Information" defaultOpen={true}>
            <div className="form-grid">
              {inputFields.slice(0, 7).map(([label, key, placeholder]) => (
                <div className={`field-block ${['linkedin'].includes(key) ? 'full-span' : ''}`} key={key}>
                  <label>{label}</label>
                  <input value={resumeData[key] || (key === 'candidateInitials' ? initialsSuggestion : '')} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Professional Details" defaultOpen={true}>
            <div className="form-grid">
              {inputFields.slice(7).map(([label, key, placeholder]) => (
                <div className="field-block" key={key}>
                  <label>{label}</label>
                  <input value={resumeData[key] || ''} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="field-block full-span" style={{ marginTop: '12px' }}>
              <label>Personal Details Visibility</label>
              <div className="visibility-toggle">
                <label className={`radio-card ${resumeData.maskPersonalDetails === true ? 'active' : ''}`}>
                  <input type="radio" name="maskPersonalDetails" checked={resumeData.maskPersonalDetails === true} onChange={() => update('maskPersonalDetails', true)} />
                  <span className="radio-card-content"><strong>Mask Personal Details</strong><small>Hides all PII: name (initials only), phone, email, LinkedIn, location, company names, institution names, and CTC in preview and exports.</small></span>
                </label>
                <label className={`radio-card ${resumeData.maskPersonalDetails === false ? 'active' : ''}`}>
                  <input type="radio" name="maskPersonalDetails" checked={resumeData.maskPersonalDetails === false} onChange={() => update('maskPersonalDetails', false)} />
                  <span className="radio-card-content"><strong>Show Personal Details</strong><small>Keep contact details visible in preview and exports.</small></span>
                </label>
              </div>
            </div>
          </Section>

          <Section title="Professional Summary &amp; Expertise" defaultOpen={true}>
            <ArrayEditor label="Professional Summary" items={resumeData.professionalSummary || []} onChange={(value) => update('professionalSummary', value)} />
            <ArrayEditor label="Expertise in" items={resumeData.expertise || []} onChange={(value) => update('expertise', value)} />
            <ArrayEditor label="Domain Experience" items={resumeData.domainExperience || []} onChange={(value) => update('domainExperience', value)} />
            <ArrayEditor label="Tools and Platforms" items={resumeData.toolsAndPlatforms || []} onChange={(value) => update('toolsAndPlatforms', value)} />
            <ArrayEditor label="Educational Qualification" items={resumeData.educationalQualification || []} onChange={(value) => update('educationalQualification', value)} />
          </Section>

          <Section title="Skills" defaultOpen={true}>
            <SkillGroupsEditor items={resumeData.skillGroups || []} onChange={(value) => update('skillGroups', value)} />
          </Section>

          <Section title="Work History" defaultOpen={true}>
            <WorkHistoryEditor items={resumeData.workHistory || []} onChange={(value) => update('workHistory', value)} />
          </Section>

          <Section title="Technical Experience &amp; Projects" defaultOpen={false}>
            <TechnicalExperienceEditor items={resumeData.technicalExperience || []} onChange={(value) => update('technicalExperience', value)} />
            <ProjectsEditor items={resumeData.projects || []} onChange={(value) => update('projects', value)} />
          </Section>

          <Section title="Achievements &amp; Certifications" defaultOpen={false}>
            <ArrayEditor label="Key Achievements" items={resumeData.keyAchievements || []} onChange={(value) => update('keyAchievements', value)} />
            <ArrayEditor label="Certifications" items={resumeData.certifications || []} onChange={(value) => update('certifications', value)} />
            <ArrayEditor label="Languages Known" items={resumeData.languagesKnown || []} onChange={(value) => update('languagesKnown', value)} />
            <AdditionalSectionsEditor items={resumeData.additionalSections || []} onChange={(value) => update('additionalSections', value)} />
          </Section>
        </section>

        <div className="right-column">
          <AtsScoreCard score={atsScore} loading={atsLoading} error={atsError} onReadMore={() => setShowAts(true)} />
          <JdMatchCard result={jdResult} loading={jdLoading} error={jdError} jobDescription={jobDescription} onReadMore={() => setShowJd(true)} />

          <section className="card preview-card-wrap">
            <div className="card-header" style={{ padding: '20px 24px 0' }}>
              <div>
                <h2>MLE Preview</h2>
                <p>Live preview of the final recruiter-facing layout.</p>
              </div>
            </div>
            <div style={{ padding: '16px 24px 24px' }}>
              <ErrorBoundary><ResumePreview data={payload} /></ErrorBoundary>
            </div>
          </section>
        </div>
      </div>

      {showAts ? <AtsScorePanel score={atsScore} onClose={() => setShowAts(false)} /> : null}
      {showJd ? <JdMatchPanel result={jdResult} onClose={() => setShowJd(false)} /> : null}
    </div>
  );
}
