import { useState, useEffect, useRef, useMemo } from 'react';
import { COLUMNS, SEED_TASKS, makeid, parseNL } from './data.js';
import Column from './components/Column.jsx';
import AIQuickAdd from './components/AIQuickAdd.jsx';
import TweaksPanel from './components/TweaksPanel.jsx';
import { Search, Sun, Moon, Plus, Filter } from './icons.jsx';

const TWEAKS_DEFAULTS = { layout: 'kanban', density: 'comfy', glass: 'full' };

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [query, setQuery] = useState('');
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [tweaks, setTweakState] = useState(TWEAKS_DEFAULTS);
  const quickRef = useRef(null);

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Apply glass intensity
  useEffect(() => {
    const root = document.documentElement;
    if (tweaks.glass === 'subtle')        root.style.setProperty('--glass-blur', 'blur(20px) saturate(120%)');
    else if (tweaks.glass === 'balanced') root.style.setProperty('--glass-blur', 'blur(28px) saturate(140%)');
    else                                  root.style.setProperty('--glass-blur', 'blur(40px) saturate(160%)');
  }, [tweaks.glass]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        quickRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function setTweak(key, value) {
    setTweakState(t => ({ ...t, [key]: value }));
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(t => t.text.toLowerCase().includes(q));
  }, [tasks, query]);

  const stats = useMemo(() => {
    const open = tasks.filter(t => !t.done);
    return {
      open: open.length,
      today: open.filter(t => t.due === 'today').length,
      overdue: open.filter(t => t.due === 'overdue').length,
      done: tasks.length - open.length,
    };
  }, [tasks]);

  function addTask({ text, due, col }) {
    if (!text) return;
    setTasks(s => [...s, {
      id: makeid(), col: col || 'team', text,
      due: due || null, done: false, starred: false,
    }]);
  }

  function toggleDone(id) {
    setTasks(s => s.map(t => {
      if (t.id !== id) return t;
      if (t.col === 'done') return { ...t, col: t.prevCol || 'team', done: false, prevCol: undefined };
      return { ...t, prevCol: t.col, col: 'done', done: true };
    }));
  }

  function updateText(id, text) {
    setTasks(s => s.map(t => t.id === id ? { ...t, text } : t));
  }

  function deleteTask(id) {
    setTasks(s => s.filter(t => t.id !== id));
  }

  function toggleStar(id) {
    setTasks(s => s.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  }

  function onAddToCol(colId) {
    const text = window.prompt(`New task for ${COLUMNS.find(c => c.id === colId)?.label}:`);
    if (text?.trim()) addTask({ text: text.trim(), col: colId });
  }

  // Drag & drop
  function onDragStart(e, id) {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragEnd() {
    setDragId(null);
    setDragOver(null);
  }
  function onColDragOver(e, colId) {
    e.preventDefault();
    setDragOver(colId);
  }
  function onColDrop(e, colId) {
    e.preventDefault();
    if (!dragId) return;
    setTasks(s => {
      const moving = s.find(t => t.id === dragId);
      if (!moving) return s;
      const rest = s.filter(t => t.id !== dragId);
      const els = e.currentTarget.querySelectorAll('.card');
      let insertBefore = null;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (e.clientY < r.top + r.height / 2 && insertBefore === null) {
          insertBefore = el.dataset.id;
        }
      });
      const updated = {
        ...moving,
        col: colId,
        done: colId === 'done',
        prevCol: colId === 'done' ? (moving.col === 'done' ? moving.prevCol : moving.col) : undefined,
      };
      if (insertBefore && insertBefore !== dragId) {
        const out = [];
        for (const t of rest) {
          if (t.id === insertBefore) out.push(updated);
          out.push(t);
        }
        return out;
      }
      const colTasks = rest.filter(t => t.col === colId);
      const others = rest.filter(t => t.col !== colId);
      return [...others, ...colTasks, updated];
    });
    setDragId(null);
    setDragOver(null);
  }

  return (
    <>
      {/* Background */}
      <div className="scene" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="app">
        {/* Top bar */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div>
              <div className="brand-name"><em>Eleanoreo</em>List</div>
            </div>
            <span className="brand-version">v0.1 · edl</span>
          </div>

          <div className="search">
            <Search />
            <input
              id="search-input"
              placeholder="Search tasks…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <kbd>⌘K</kbd>
          </div>

          <div className="top-actions">
            <button className="icon-btn" title="Filter"><Filter /></button>
            <button
              className="icon-btn"
              title="Toggle theme"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
            <button className="cta" onClick={() => quickRef.current?.focus()}>
              <Plus /> New task
            </button>
          </div>
        </div>

        {/* Page header */}
        <div className="page-head">
          <div>
            <h1 className="page-title">Hi Eleanor, <em>it&apos;s Wednesday, May 7</em>.</h1>
            <p className="page-sub">
              {stats.open} open · {stats.today} due today
              {stats.overdue > 0 ? ` · ${stats.overdue} overdue` : ''}
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-num">{stats.open}</div>
              <div className="stat-lbl">Open</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.today}</div>
              <div className="stat-lbl">Today</div>
            </div>
            <div className="stat">
              <div className="stat-num" style={{ color: '#FFBCC8' }}>{stats.overdue}</div>
              <div className="stat-lbl">Overdue</div>
            </div>
            <div className="stat">
              <div className="stat-num" style={{ opacity: 0.5 }}>{stats.done}</div>
              <div className="stat-lbl">Done</div>
            </div>
          </div>
        </div>

        {/* AI quick add */}
        <AIQuickAdd ref={quickRef} onAdd={addTask} />

        {/* Board */}
        <div className={`board${tweaks.density === 'compact' ? ' compact' : ''}${tweaks.layout === 'list' ? ' list' : ''}`}>
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              col={col}
              tasks={filtered.filter(t => t.col === col.id)}
              dragOver={dragOver === col.id}
              dragId={dragId}
              onDragOver={e => onColDragOver(e, col.id)}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => onColDrop(e, col.id)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onToggle={toggleDone}
              onEdit={updateText}
              onDelete={deleteTask}
              onStar={toggleStar}
              onAddPrompt={() => onAddToCol(col.id)}
            />
          ))}
        </div>

        {/* Footer hints */}
        <div className="foot">
          <span><kbd>⌘K</kbd> search</span>
          <span><kbd>⌘N</kbd> new task</span>
          <span><kbd>by friday</kbd> due date</span>
          <span><kbd>#team</kbd> <kbd>#leadership</kbd> <kbd>#house</kbd> bucket</span>
        </div>
      </div>

      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}
