export function ProjectsEditor({ items = [], onChange }) {
  const safeItems = Array.isArray(items) ? items : [];

  const updateItem = (index, patch) => {
    const next = [...safeItems];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateList = (index, listName, itemIndex, value) => {
    const nextList = [...(safeItems[index]?.[listName] || [''])];
    nextList[itemIndex] = value;
    updateItem(index, { [listName]: nextList });
  };

  const addProject = () => onChange([...safeItems, { name: '', role: '', duration: '', technologies: [''], highlights: [''] }]);
  const removeProject = (index) => {
    if (!window.confirm('Remove this project?')) return;
    onChange(safeItems.filter((_, idx) => idx !== index));
  };
  const addListItem = (index, listName) => updateItem(index, { [listName]: [...(safeItems[index]?.[listName] || []), ''] });
  const removeListItem = (index, listName, itemIndex) => {
    const nextList = (safeItems[index]?.[listName] || []).filter((_, idx) => idx !== itemIndex);
    updateItem(index, { [listName]: nextList.length ? nextList : [''] });
  };

  return (
    <div className="editor-section">
      <div className="editor-head">
        <h3>Projects</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addProject}>+ Add Project</button>
      </div>

      {safeItems.length === 0 ? (
        <p className="editor-empty">No projects added yet.</p>
      ) : null}

      {safeItems.map((item, index) => (
        <div className="editor-item-card" key={`project-${index}`}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field-block">
              <label>Project Name</label>
              <input value={item.name || ''} onChange={(e) => updateItem(index, { name: e.target.value })} />
            </div>
            <div className="field-block">
              <label>Role</label>
              <input value={item.role || ''} onChange={(e) => updateItem(index, { role: e.target.value })} />
            </div>
            <div className="field-block full-span">
              <label>Duration</label>
              <input value={item.duration || ''} onChange={(e) => updateItem(index, { duration: e.target.value })} />
            </div>
          </div>

          <label className="sub-label">Technologies</label>
          {(item.technologies || ['']).map((entry, itemIndex) => (
            <div className="inline-row" key={`project-${index}-tech-${itemIndex}`}>
              <input value={entry} onChange={(e) => updateList(index, 'technologies', itemIndex, e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm btn-icon danger" onClick={() => removeListItem(index, 'technologies', itemIndex)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => addListItem(index, 'technologies')}>+ Add Technology</button>

          <label className="sub-label">Highlights</label>
          {(item.highlights || ['']).map((entry, itemIndex) => (
            <div className="inline-row" key={`project-${index}-highlight-${itemIndex}`}>
              <textarea rows="2" value={entry} onChange={(e) => updateList(index, 'highlights', itemIndex, e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm btn-icon danger" onClick={() => removeListItem(index, 'highlights', itemIndex)}>✕</button>
            </div>
          ))}

          <div className="stack-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addListItem(index, 'highlights')}>+ Add Highlight</button>
            <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => removeProject(index)}>Remove Project</button>
          </div>
        </div>
      ))}
    </div>
  );
}
