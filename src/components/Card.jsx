import { useRef } from 'react';
import { Check, Star, StarFill, X, Clock } from '../icons.jsx';
import { dueLabel } from '../data.js';

export default function Card({ task, accent, onToggle, onEdit, onDelete, onStar, onUpdateDue, onDragStart, onDragEnd, dragging }) {
  const due = dueLabel(task.due);
  const textRef = useRef(null);
  const dateRef = useRef(null);

  function openDatePicker() {
    if (!dateRef.current) return;
    // Pre-fill with a rough ISO date from the current label
    const today = new Date();
    let iso = '';
    if (task.due === 'today') iso = toISO(today);
    else if (task.due === 'tomorrow') { const d = new Date(today); d.setDate(d.getDate()+1); iso = toISO(d); }
    else if (task.due?.startsWith('+')) { const d = new Date(today); d.setDate(d.getDate() + parseInt(task.due.slice(1))); iso = toISO(d); }
    dateRef.current.value = iso;
    dateRef.current.showPicker?.() ?? dateRef.current.click();
  }

  function toISO(d) {
    return d.toISOString().slice(0, 10);
  }

  function handleBlur(e) {
    const newText = e.target.textContent.trim();
    if (newText && newText !== task.text) onEdit(newText);
    else if (textRef.current) textRef.current.textContent = task.text;
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    if (e.key === 'Escape') {
      if (textRef.current) textRef.current.textContent = task.text;
      e.target.blur();
    }
  }

  return (
    <div
      className={`card${task.done ? ' done' : ''}${task.starred ? ' starred' : ''}${dragging ? ' dragging' : ''}`}
      draggable
      data-id={task.id}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ '--accent': accent }}
    >
      <div className="card-row1">
        <div className="check" style={{ '--accent': accent }} onClick={onToggle}>
          <Check />
        </div>
        <div
          ref={textRef}
          className="card-text"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          {task.text}
        </div>
        <button
          className={`card-star${task.starred ? ' on' : ''}`}
          onClick={onStar}
          title={task.starred ? 'Unstar' : 'Star'}
        >
          {task.starred ? <StarFill /> : <Star />}
        </button>
      </div>
      <div className="card-row2">
        {due ? (
          <button
            className={`pill pill-btn${due.cls ? ' ' + due.cls : ''}`}
            onClick={openDatePicker}
            title="Edit due date"
          >
            <Clock />{due.label}
          </button>
        ) : (
          <button className="pill pill-btn pill-add-date" onClick={openDatePicker} title="Add due date">
            <Clock />Add date
          </button>
        )}
        <input
          ref={dateRef}
          type="date"
          className="card-date-input"
          onChange={e => onUpdateDue(e.target.value || null)}
        />
      </div>
      <button className="card-delete" title="Delete task" onClick={onDelete}>
        <X />
      </button>
    </div>
  );
}
