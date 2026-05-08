import { useState, useRef, useEffect } from 'react';

const STORAGE_KEY = 'edl-scratchpad';

function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export default function Scratchpad() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(loadItems);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function addItem() {
    const text = draft.trim();
    if (!text) return;
    setItems(s => [...s, { id: Date.now(), text }]);
    setDraft('');
  }

  function removeItem(id) {
    setItems(s => s.filter(i => i.id !== id));
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addItem(); }
    if (e.key === 'Escape') setOpen(false);
  }

  if (!open) {
    return (
      <button
        className="scratchpad-fab"
        onClick={() => setOpen(true)}
        title="Top of mind"
      >
        <span className="scratchpad-fab-emoji">🐱</span>
        {items.length > 0 && <span className="scratchpad-fab-badge">{items.length}</span>}
      </button>
    );
  }

  return (
    <div className="scratchpad-panel">
      <div className="scratchpad-header">
        <span className="scratchpad-title">Top of mind</span>
        <button className="scratchpad-close" onClick={() => setOpen(false)}>×</button>
      </div>

      <ul className="scratchpad-list">
        {items.length === 0 && (
          <li className="scratchpad-empty">Nothing yet — add a thought below</li>
        )}
        {items.map(item => (
          <li key={item.id} className="scratchpad-item">
            <span className="scratchpad-dot" />
            <span className="scratchpad-item-text">{item.text}</span>
            <button className="scratchpad-remove" onClick={() => removeItem(item.id)} title="Remove">×</button>
          </li>
        ))}
      </ul>

      <div className="scratchpad-input-row">
        <input
          ref={inputRef}
          className="scratchpad-input"
          placeholder="Add a thought…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="scratchpad-add" onClick={addItem} disabled={!draft.trim()}>+</button>
      </div>
    </div>
  );
}
