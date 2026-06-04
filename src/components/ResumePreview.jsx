import React, { useMemo } from 'react';
import { normalizeResume } from '../../../server/src/utils/schema.js';
import { buildResumeHtml } from '../../../server/src/templates/mleTemplate.js';

export function ResumePreview({ data = {} }) {
  const resume = normalizeResume(data);

  const html = useMemo(() => buildResumeHtml(resume), [resume]);

  return (
    <div className="preview-sheet">
      <iframe
        srcDoc={html}
        title="Resume Preview"
        style={{
          width: '100%',
          height: '297mm',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}

export default ResumePreview;
