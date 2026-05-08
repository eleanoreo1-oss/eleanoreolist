import { useState, useEffect, useRef } from 'react';
import { Star, StarFill, Plus } from '../icons.jsx';
import { COLUMNS } from '../data.js';

export default function NewTaskModal({ onAdd, onClose, defaultCol }) {
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [starred, setStarred] = useState(false);
  const [col, setCol] = useState(defaultCol || 'team');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ text: text.trim(), due: due || null, starred, col });
    onClose();
  }

  const activeCols = COLUMNS.filter(c => !c.isDone);

  return (
    <div className="modal-scrim" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <span className="modal-title">New task</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="modal-body" onSubmit={submit}>
          {/* Task text */}
          <div className="modal-field">
            <label className="modal-label">What's the task?</label>
            <input
              ref={inputRef}
              className="modal-input"
              placeholder="e.g. Send brief to Meghan"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          {/* Due date */}
          <div className="modal-field">
            <label className="modal-label">When is it due? <span className="modal-optional">optional</span></label>
            <input
              type="date"
              className="modal-input modal-date"
              value={due}
              onChange={e => setDue(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          {/* Bucket */}
          <div className="modal-field">
            <label className="modal-label">Which bucket?</label>
            <div className="modal-seg">
              {activeCols.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`modal-seg-btn${col === c.id ? ' active' : ''}`}
                  onClick={() => setCol(c.id)}
                >
                  {c.short}
                </button>
              ))}
            </div>
          </div>

          {/* Starred */}
          <div className="modal-field modal-row">
            <label className="modal-label">Mark as starred?</label>
            <button
              type="button"
              className={`modal-star${starred ? ' on' : ''}`}
              onClick={() => setStarred(s => !s)}
              aria-label={starred ? 'Unstar' : 'Star'}
            >
              {starred ? <StarFill /> : <Star />}
              {starred ? 'Starred' : 'Star it'}
            </button>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-submit" disabled={!text.trim()}>
              <Plus /> Add task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
