import { useState, useEffect, useRef } from 'react';
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

const personalFields = [
  ['Candidate Name', 'candidateName', 'Enter candidate name'],
  ['Candidate Initials', 'candidateInitials', 'Auto-generated initials'],
  ['Title', 'title', 'e.g. SAP Finance Consultant'],
  ['Phone', 'phone', 'Phone number'],
  ['Email', 'email', 'Email address'],
  ['Location', 'location', 'City, State'],
  ['LinkedIn', 'linkedin', 'LinkedIn URL'],
];

const professionalFields = [
  ['Total Experience', 'totalExperience', 'e.g. 7+ Years'],
  ['Current Company', 'currentCompany', 'Current employer'],
  ['Current Designation', 'currentDesignation', 'Current title'],
  ['Notice Period', 'noticePeriod', 'e.g. 30 days'],
  ['Current CTC', 'currentCtc', 'Current compensation'],
  ['Expected CTC', 'expectedCtc', 'Expected compensation'],
  ['Highest Qualification', 'highestQualification', 'Highest degree']
];

function Section({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = title.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className="form-section">
      <button
        type="button"
        id={`section-${sectionId}-btn`}
        className={`form-section-toggle${open ? '' : ' collapsed'}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`section-${sectionId}`}
      >
        <span>{title}</span>
        <span className="collapse-icon" aria-hidden="true">▼</span>
      </button>
      <div
        id={`section-${sectionId}`}
        role="region"
        aria-labelledby={`section-${sectionId}-btn`}
        className={`form-section-content${open ? '' : ' collapsed'}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [resumeData, setResumeData] = useState(() => JSON.parse(JSON.stringify({ ...defaultResume, maskPersonalDetails: true })));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);


  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const [message, setMessage] = useState('Upload a PDF or DOCX resume to convert it into a stronger MLE-style profile and export a recruiter-ready PDF.');
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
  const jdTimeoutRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    if (parseAbortRef.current) parseAbortRef.current.abort();
    const controller = new AbortController();
    parseAbortRef.current = controller;
    handleParse(file, controller.signal);
    return () => {
      controller.abort();
      if (jdTimeoutRef.current) clearTimeout(jdTimeoutRef.current);
    };
  }, [file]);

  const getInitials = () => {
    if (resumeData.candidateInitials?.trim()) return resumeData.candidateInitials.trim();
    return (resumeData.candidateName || '').split(/\s+/).filter(Boolean).map((part) => part[0]?.toUpperCase()).slice(0, 3).join('');
  };

  const update = (key, value) => setResumeData((prev) => ({ ...prev, [key]: value }));
  const buildPayload = () => {
    const payload = { ...resumeData };
    payload.candidateInitials = payload.candidateInitials?.trim() || getInitials();
    if (Array.isArray(payload.projects) && payload.projects.length > 0) {
      payload.projectExperience = payload.projects.map((p) => ({
        role: [p.name, p.role].filter(Boolean).join(' - '),
        duration: p.duration || '',
        contributions: Array.isArray(p.highlights) ? p.highlights : [],
        client: '',
        employer: '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
      }));
    }
    return payload;
  };
  const payload = buildPayload();

  const msgLower = message.toLowerCase();
  const isError = msgLower.includes('fail') || msgLower.includes('went wrong') || msgLower.includes('error');
  const isSuccess = msgLower.includes('success') || msgLower.includes('parsed');
  const statusClass = loading ? 'loading' : isError ? 'error' : isSuccess ? 'success' : '';

  const handleParse = async (fileToParse, signal) => {
    if (!fileToParse) return;
    const formData = new FormData();
    formData.append('resume', fileToParse);
    setLoading(true);
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
      if (result.parsedData?.projectExperience?.length) {
        newData.projects = result.parsedData.projectExperience.map(p => ({
          name: p.role || '',
          role: '',
          duration: p.duration || '',
          technologies: p.technologies || [],
          highlights: p.contributions || [],
        }));
      }
      newExtractedText = result.extractedText || '';
      setResumeData(newData);
      setExtractedText(newExtractedText);
      setMessage(result.message || 'Resume parsed successfully. Review the data and export the final file.');

      const newPayload = { ...newData, candidateInitials: (newData.candidateInitials || '').trim() || (newData.candidateName || '').split(/\s+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).slice(0, 3).join('') };
      // ATS scoring runs in background — doesn't block editing
      const atsController = new AbortController();
      parseAbortRef.current = atsController;
      setAtsLoading(true);
      fetch(`${API_BASE_URL}/api/resumes/ats-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: newPayload, rawText: newExtractedText }),
        signal: atsController.signal
      })
        .then(async (r) => {
          if (!r.ok) {
            const errBody = await r.json().catch(() => ({}));
            throw new Error(errBody.error || `ATS scoring failed (${r.status})`);
          }
          return r.json();
        })
        .then((r) => {
          if (r.success === false) throw new Error(r.error || 'ATS score analysis failed');
          setAtsScore(r);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setAtsError(err.message);
        })
        .finally(() => setAtsLoading(false));
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

  const handleGenerate = async () => {
    if (!resumeData.candidateName && !file && !extractedText) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildPayload(), rawText: extractedText })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'PDF generation failed.');
      }
      const blob = await response.blob();
      const cd = response.headers.get('Content-Disposition');
      const fileName = cd?.match(/filename\*?=(?:UTF-8\'\')?"?([^"]+)"?/)?.[1] || 'resume.pdf';
      triggerDownload(blob, fileName);
      const atsHeader = response.headers.get('X-ATS-Score');
      if (atsHeader) {
        try { setAtsScore(JSON.parse(decodeURIComponent(atsHeader))); } catch { /* ignore */ }
      }
      setMessage('PDF downloaded successfully.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong while generating the PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocx = async () => {
    if (!resumeData.candidateName && !file && !extractedText) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/generate-docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildPayload(), rawText: extractedText })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'DOCX generation failed.');
      }
      const blob = await response.blob();
      const cd = response.headers.get('Content-Disposition');
      const fileName = cd?.match(/filename\*?=(?:UTF-8\'\')?"?([^"]+)"?/)?.[1] || 'resume.docx';
      triggerDownload(blob, fileName);
      setMessage('DOCX downloaded successfully.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong while generating the DOCX.');
    } finally {
      setLoading(false);
    }
  };

  const showRetry = !loading && isError && file;

  return (
    <div className="app-shell">
      <header className="hero-card card">
        <div className="hero-copy">
          <p className="eyebrow">MLE SYSTEMS</p>
          <h1>Recruiter Resume Formatter</h1>
          <p className="subtext">Upload a resume, structure it into the MLE format, enrich the candidate profile, and export a recruiter-ready PDF.</p>
        </div>
        <div className="hero-badge-panel">
          <div className="hero-badge"><span className="hero-badge-label">Format</span><strong>MLE PDF / DOCX</strong></div>
          <div className="hero-badge"><span className="hero-badge-label">Input</span><strong>PDF / DOCX</strong></div>
        </div>
      </header>

      <section className="toolbar card">
        <div className="upload-block">
          <label className="upload-label" htmlFor="resume-file-input">Resume File</label>
          <input id="resume-file-input" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <p className="helper-text">Supported formats: PDF, DOC, DOCX{file ? ` • Selected: ${file.name}` : ''}</p>
        </div>
        <div className="toolbar-actions">
          <button type="button" onClick={handleParseButton} disabled={loading} className="btn btn-primary">{loading ? 'Processing…' : 'Parse Resume'}</button>
          <button type="button" className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>Generate PDF</button>
          <button type="button" className="btn btn-secondary" onClick={handleGenerateDocx} disabled={loading}>Generate DOCX</button>

        </div>
      </section>

      <section className="toolbar card" style={{ marginTop: '8px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="upload-label">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (jdTimeoutRef.current) clearTimeout(jdTimeoutRef.current);
              jdTimeoutRef.current = setTimeout(() => { setJdResult(null); setJdError(null); }, 300);
            }}
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
        {showRetry ? <button type="button" className="btn btn-ghost" onClick={handleParseButton} style={{ marginTop: '8px' }}>Retry</button> : null}
      </section>

      <div className="layout-grid">
        <section className="card form-card">
          <div className="card-header">
            <div>
              <h2>Editable Resume Data</h2>
              <p>Refine extracted content before exporting the final MLE profile.</p>
            </div>
          </div>

          <ErrorBoundary>
          <Section title="Personal Information" defaultOpen={true}>
            <div className="form-grid">
              {personalFields.map(([label, key, placeholder]) => (
                <div className={`field-block ${['linkedin'].includes(key) ? 'full-span' : ''}`} key={key}>
                  <label>{label}</label>
                  <input value={resumeData[key] || (key === 'candidateInitials' ? getInitials() : '')} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Professional Details" defaultOpen={true}>
            <div className="form-grid">
              {professionalFields.map(([label, key, placeholder]) => (
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
          </ErrorBoundary>
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
