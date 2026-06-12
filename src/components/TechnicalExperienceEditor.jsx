export function TechnicalExperienceEditor({ items = [], onChange }) {
  const safeItems = Array.isArray(items) ? items : [];

  const updateItem = (index, patch) => {
    const next = [...safeItems];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateListItem = (index, listName, itemIndex, value) => {
    const list = [...(safeItems[index]?.[listName] || [''])];
    list[itemIndex] = value;
    updateItem(index, { [listName]: list });
  };

  const addBlock = () => onChange([...safeItems, { role: '', company: '', client: '', duration: '', environment: [''], contributions: [''] }]);
  const removeBlock = (index) => {
    onChange(safeItems.filter((_, idx) => idx !== index));
  };
  const addListItem = (index, listName) => updateItem(index, { [listName]: [...(safeItems[index]?.[listName] || []), ''] });
  const removeListItem = (index, listName, itemIndex) => {
    const list = (safeItems[index]?.[listName] || []).filter((_, idx) => idx !== itemIndex);
    updateItem(index, { [listName]: list.length ? list : [''] });
  };

  return (
    <div className="editor-section">
      <div className="editor-head">
        <h3>Technical Experience</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addBlock}>+ Add Role</button>
      </div>

      {safeItems.length === 0 ? (
        <p className="editor-empty">No technical experience added yet.</p>
      ) : null}

      {safeItems.map((item, index) => (
        <div className="editor-item-card" key={`exp-${index}`}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field-block">
              <label>Role</label>
              <input value={item.role || ''} onChange={(e) => updateItem(index, { role: e.target.value })} />
            </div>
            <div className="field-block">
              <label>Company</label>
              <input value={item.company || ''} onChange={(e) => updateItem(index, { company: e.target.value })} />
            </div>
            <div className="field-block">
              <label>Client</label>
              <input value={item.client || ''} onChange={(e) => updateItem(index, { client: e.target.value })} />
            </div>
            <div className="field-block">
              <label>Duration</label>
              <input value={item.duration || ''} onChange={(e) => updateItem(index, { duration: e.target.value })} />
            </div>
          </div>

          <label className="sub-label">Environment / Stack</label>
          {(item.environment || ['']).map((entry, envIndex) => (
            <div className="inline-row" key={`exp-${index}-env-${envIndex}`}>
              <input value={entry} onChange={(e) => updateListItem(index, 'environment', envIndex, e.target.value)} placeholder="SAP S/4HANA, FICO, etc." />
              <button type="button" className="btn btn-ghost btn-sm btn-icon danger" onClick={() => removeListItem(index, 'environment', envIndex)} aria-label="Remove environment item">✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addListItem(index, 'environment')}>+ Add Environment Item</button>

          <label className="sub-label">Key Contributions</label>
          {(item.contributions || ['']).map((entry, contributionIndex) => (
            <div className="inline-row" key={`exp-${index}-c-${contributionIndex}`}>
              <textarea rows="2" value={entry} onChange={(e) => updateListItem(index, 'contributions', contributionIndex, e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm btn-icon danger" onClick={() => removeListItem(index, 'contributions', contributionIndex)} aria-label="Remove contribution">✕</button>
            </div>
          ))}

          <div className="stack-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addListItem(index, 'contributions')}>+ Add Contribution</button>
            <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => removeBlock(index)}>Remove Role</button>
          </div>
        </div>
      ))}
    </div>
  );
}
