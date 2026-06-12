export function WorkHistoryEditor({ items = [], onChange }) {
  const safeItems = Array.isArray(items) ? items : [];

  const updateItem = (index, key, value) => {
    const next = [...safeItems];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const addItem = () => onChange([...safeItems, { company: 'Confidential', role: '', duration: '' }]);
  const removeItem = (index) => {
    onChange(safeItems.filter((_, idx) => idx !== index));
  };

  return (
    <div className="editor-section">
      <div className="editor-head">
        <h3>Work History</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Role</button>
      </div>

      {safeItems.length === 0 ? (
        <p className="editor-empty">No work history added yet.</p>
      ) : null}

      {safeItems.map((item, index) => (
        <div className="editor-item-card" key={`work-${index}`}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field-block">
              <label>Company</label>
              <input value={item.company || ''} onChange={(e) => updateItem(index, 'company', e.target.value)} />
            </div>
            <div className="field-block">
              <label>Role</label>
              <input value={item.role || ''} onChange={(e) => updateItem(index, 'role', e.target.value)} />
            </div>
            <div className="field-block full-span">
              <label>Duration</label>
              <input value={item.duration || ''} onChange={(e) => updateItem(index, 'duration', e.target.value)} />
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => removeItem(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
