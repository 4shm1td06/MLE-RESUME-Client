export function ArrayEditor({ label, items = [], onChange }) {
  const safeItems = Array.isArray(items) ? items : [];

  const updateItem = (index, value) => {
    const next = [...safeItems];
    next[index] = value;
    onChange(next);
  };

  const addItem = () => onChange([...safeItems, '']);
  const removeItem = (index) => {
    if (!window.confirm(`Remove this ${label} item?`)) return;
    onChange(safeItems.filter((_, idx) => idx !== index));
  };
  const moveItem = (from, to) => {
    if (to < 0 || to >= safeItems.length) return;
    const next = [...safeItems];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="editor-section">
      <div className="editor-head">
        <h3>{label}</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Add</button>
      </div>

      {safeItems.length === 0 ? (
        <p className="editor-empty">No items added yet.</p>
      ) : null}

      {safeItems.map((item, index) => (
        <div className="inline-row" key={`${label}-${index}`}>
          <textarea
            rows="2"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={`${label} item ${index + 1}`}
          />
          <div className="btn-group">
            <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => moveItem(index, index - 1)} disabled={index === 0}>▲</button>
            <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={() => moveItem(index, index + 1)} disabled={index === safeItems.length - 1}>▼</button>
            <button type="button" className="btn btn-ghost btn-sm btn-icon danger" onClick={() => removeItem(index)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
