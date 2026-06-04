export function AdditionalSectionsEditor({ items = [], onChange }) {
  const safeItems = Array.isArray(items) ? items : [];

  const updateSection = (index, patch) => {
    const next = [...safeItems];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateItem = (sectionIndex, itemIndex, value) => {
    const nextItems = [...(safeItems[sectionIndex]?.items || [''])];
    nextItems[itemIndex] = value;
    updateSection(sectionIndex, { items: nextItems });
  };

  const addSection = () => onChange([...safeItems, { title: '', items: [''] }]);
  const removeSection = (index) => {
    if (!window.confirm('Remove this additional section?')) return;
    onChange(safeItems.filter((_, idx) => idx !== index));
  };
  const addItem = (sectionIndex) => updateSection(sectionIndex, { items: [...(safeItems[sectionIndex]?.items || []), ''] });
  const removeItem = (sectionIndex, itemIndex) => {
    const nextItems = (safeItems[sectionIndex]?.items || []).filter((_, idx) => idx !== itemIndex);
    updateSection(sectionIndex, { items: nextItems.length ? nextItems : [''] });
  };

  return (
    <div className="editor-section">
      <div className="editor-head">
        <h3>Additional Sections</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addSection}>+ Add Section</button>
      </div>

      {safeItems.length === 0 ? (
        <p className="editor-empty">No additional sections added yet.</p>
      ) : null}

      {safeItems.map((section, sectionIndex) => (
        <div className="editor-item-card" key={`section-${sectionIndex}`}>
          <div className="field-block" style={{ marginBottom: '10px' }}>
            <label>Section Title</label>
            <input value={section.title || ''} onChange={(e) => updateSection(sectionIndex, { title: e.target.value })} />
          </div>

          {(section.items || ['']).map((entry, itemIndex) => (
            <div className="inline-row" key={`section-${sectionIndex}-item-${itemIndex}`}>
              <textarea rows="2" value={entry} onChange={(e) => updateItem(sectionIndex, itemIndex, e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm btn-icon danger" onClick={() => removeItem(sectionIndex, itemIndex)}>✕</button>
            </div>
          ))}

          <div className="stack-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addItem(sectionIndex)}>+ Add Item</button>
            <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => removeSection(sectionIndex)}>Remove Section</button>
          </div>
        </div>
      ))}
    </div>
  );
}
