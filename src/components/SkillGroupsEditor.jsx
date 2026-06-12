export function SkillGroupsEditor({ items = [], onChange }) {
  const safeItems = Array.isArray(items) ? items : [];

  const updateGroup = (index, patch) => {
    const next = [...safeItems];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateItem = (groupIndex, itemIndex, value) => {
    const nextItems = [...(safeItems[groupIndex]?.items || [''])];
    nextItems[itemIndex] = value;
    updateGroup(groupIndex, { items: nextItems });
  };

  const addGroup = () => onChange([...safeItems, { title: '', items: [''] }]);
  const removeGroup = (index) => {
    onChange(safeItems.filter((_, idx) => idx !== index));
  };
  const addItem = (groupIndex) => updateGroup(groupIndex, { items: [...(safeItems[groupIndex]?.items || []), ''] });
  const removeItem = (groupIndex, itemIndex) => {
    const nextItems = (safeItems[groupIndex]?.items || []).filter((_, idx) => idx !== itemIndex);
    updateGroup(groupIndex, { items: nextItems.length ? nextItems : [''] });
  };

  return (
    <div className="editor-section">
      <div className="editor-head">
        <h3>Technical Skills Groups</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addGroup}>+ Add Group</button>
      </div>

      {safeItems.length === 0 ? (
        <p className="editor-empty">No skill groups added yet.</p>
      ) : null}

      {safeItems.map((group, groupIndex) => (
        <div className="editor-item-card" key={`skill-group-${groupIndex}`}>
          <div className="field-block" style={{ marginBottom: '10px' }}>
            <label>Group Title</label>
            <input value={group?.title || ''} onChange={(e) => updateGroup(groupIndex, { title: e.target.value })} />
          </div>

          {(group?.items || ['']).map((item, itemIndex) => (
            <div className="inline-row" key={`skill-${groupIndex}-${itemIndex}`}>
              <input
                value={item}
                onChange={(e) => updateItem(groupIndex, itemIndex, e.target.value)}
                placeholder={`Skill item ${itemIndex + 1}`}
              />
              <button type="button" className="btn btn-ghost btn-sm btn-icon danger" onClick={() => removeItem(groupIndex, itemIndex)} aria-label="Remove skill item">✕</button>
            </div>
          ))}

          <div className="stack-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => addItem(groupIndex)}>+ Add Skill</button>
            <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => removeGroup(groupIndex)}>Remove Group</button>
          </div>
        </div>
      ))}
    </div>
  );
}
