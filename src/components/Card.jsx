import { useRef } from 'react';
import { Check, Star, StarFill, X, Clock } from '../icons.jsx';
import { dueLabel } from '../data.js';

export default function Card({ task, accent, onToggle, onEdit, onDelete, onStar, onDragStart, onDragEnd, dragging }) {
  const due = dueLabel(task.due);
  const textRef = useRef(null);

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
      {due && (
        <div className="card-row2">
          <span className={`pill${due.cls ? ' ' + due.cls : ''}`}>
            <Clock />{due.label}
          </span>
        </div>
      )}
      <button className="card-delete" title="Delete task" onClick={onDelete}>
        <X />
      </button>
    </div>
  );
}
