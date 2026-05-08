import Card from './Card.jsx';
import { Plus } from '../icons.jsx';

export default function Column({ col, tasks, dragOver, dragId, onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd, onToggle, onEdit, onDelete, onStar, onUpdateDue, onAddPrompt }) {
  return (
    <div
      className={`col${col.isDone ? ' col-done' : ''}${dragOver ? ' drag-over' : ''}`}
      style={{ '--accent': col.accent }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="col-head">
        <span className="col-dot" />
        <span className="col-title">{col.label}</span>
        <span className="col-count">{tasks.length}</span>
        {!col.isDone && (
          <button className="col-add" title={`Add to ${col.label}`} onClick={onAddPrompt}>
            <Plus />
          </button>
        )}
      </div>

      <div className="cards">
        {tasks.length === 0 && (
          <div className="empty">Drop a task here, or click +</div>
        )}
        {tasks.map(task => (
          <Card
            key={task.id}
            task={task}
            accent={col.accent}
            dragging={dragId === task.id}
            onToggle={() => onToggle(task.id)}
            onEdit={(text) => onEdit(task.id, text)}
            onDelete={() => onDelete(task.id)}
            onStar={() => onStar(task.id)}
            onUpdateDue={(iso) => onUpdateDue(task.id, iso)}
            onDragStart={(e) => onDragStart(e, task.id)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
