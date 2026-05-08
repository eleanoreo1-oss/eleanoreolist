/* EleanoreoList — main app */
const { useState, useEffect, useRef, useMemo } = React;

const COLUMNS = [
  { id: 'team',       label: 'Enterprise Team',       short: 'Team',       accent: '#928AFF' },
  { id: 'leadership', label: 'Leadership Initiatives', short: 'Leadership', accent: '#928AFF' },
  { id: 'life',       label: 'Life & Housekeeping',   short: 'Life',       accent: '#928AFF' },
  { id: 'done',       label: 'Completed',             short: 'Done',       accent: '#5B5870', isDone: true },
];

const SEED = [
  { id: 't1', col: 'team',       text: 'Write email to Bobby re: Q2 platform roadmap', due: 'today',     done: false, starred: true },
  { id: 't2', col: 'team',       text: 'Finish calibration guide for Meghan',           due: 'tomorrow',  done: false, starred: true },
  { id: 't3', col: 'done',       text: 'Review tooling team OKRs',                      due: null,        done: true, prevCol: 'team' },
  { id: 't4', col: 'leadership', text: 'Empathy museum buildout — phase 2 brief',       due: '+3d',       done: false, starred: true },
  { id: 't5', col: 'leadership', text: 'Prep talking points for Wednesday all-hands',   due: 'tomorrow',  done: false },
  { id: 't6', col: 'leadership', text: 'Sponsor: internal AI guild proposal',           due: null,        done: false },
  { id: 't7', col: 'life',       text: 'Inquire about taxes',                           due: '+5d',       done: false },
  { id: 't8', col: 'life',       text: 'Approve travel for offsite',                    due: 'overdue',   done: false, starred: true },
  { id: 't9', col: 'life',       text: 'Renew laptop loaner for the team',              due: null,        done: false },
  { id: 't10', col: 'life',      text: 'Book dentist',                                  due: null,        done: false },
  { id: 't11', col: 'life',      text: 'Pick up dry cleaning',                          due: 'today',     done: false },
];

/* ============================================================
   Natural-language parser for quick add
   "Write report by friday !p0 #personal" → { text, priority, due, col }
   ============================================================ */
function parseNL(input) {
  let text = input;
  let priority = null;
  let due = null;
  let col = null;

  // Priority: !p0 / !p1 / !p2 or !! / ! / blank
  const pMatch = text.match(/(?:^|\s)(!{1,3}|!p[0-2])/i);
  if (pMatch) {
    const tag = pMatch[1].toLowerCase();
    if (tag === '!p0' || tag === '!!!') priority = 'P0';
    else if (tag === '!p1' || tag === '!!') priority = 'P1';
    else if (tag === '!p2' || tag === '!') priority = 'P2';
    text = text.replace(pMatch[0], ' ');
  }

  // Bucket: #team #leadership #life (and aliases)
  const cMatch = text.match(/(?:^|\s)#(team|leadership|life|house(?:keeping)?|personal|enterprise)\b/i);
  if (cMatch) {
    const c = cMatch[1].toLowerCase();
    col = (c.startsWith('life') || c.startsWith('house') || c.startsWith('person')) ? 'life'
        : c.startsWith('lead') ? 'leadership'
        : 'team';
    text = text.replace(cMatch[0], ' ');
  }

  // Due: "by today/tomorrow/friday" or "in 3d"
  const dMatch = text.match(/\b(?:by|on|due)\s+(today|tomorrow|mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
    || text.match(/\bin\s+(\d+)\s*d\b/i);
  if (dMatch) {
    const v = dMatch[1].toLowerCase();
    if (/^\d+$/.test(v)) due = '+' + v + 'd';
    else if (v === 'today') due = 'today';
    else if (v === 'tomorrow') due = 'tomorrow';
    else due = v.slice(0,3);
    text = text.replace(dMatch[0], ' ');
  }

  text = text.replace(/\s+/g, ' ').trim();
  return { text, priority, due, col };
}

/* ============================================================
   AI Quick Add — uses window.claude.complete to interpret NL
   ============================================================ */
const AIQuickAdd = React.forwardRef(({ onAdd }, ref) => {
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [preview, setPreview] = useState(null); // {text, priority, due, col, reasoning}

  async function interpret() {
    const v = text.trim();
    if (!v) return;
    setThinking(true);
    setPreview(null);

    // Try Claude first; fall back to local parser
    try {
      const prompt = `You are a task triage assistant for Eleanor's personal kanban board.
She has 3 buckets:
  - "team": Enterprise Team (her direct reports, eng & design tooling work)
  - "leadership": Leadership Initiatives (cross-org, exec, big-bet projects)
  - "life": Life & Housekeeping (admin, taxes, errands, personal appointments)

Given this user input, return ONLY a single-line JSON object with these keys:
  text: cleaned task title (no priority/date markers, imperative voice)
  col: one of "team" | "leadership" | "life"
  priority: "P0" (urgent/blocker) | "P1" (important) | "P2" (normal)
  due: one of "today" | "tomorrow" | "+Nd" (N days) | "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun" | null
  reasoning: 4-7 word justification of bucket choice

Input: ${JSON.stringify(v)}

Respond with ONLY the JSON, no prose, no code fences.`;

      const raw = await window.claude.complete(prompt);
      const cleaned = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);
      setPreview(parsed);
    } catch (err) {
      // Local fallback
      const local = parseNL(v);
      setPreview({ ...local, col: local.col || 'team', reasoning: 'Local parse (offline)' });
    }
    setThinking(false);
  }

  function confirm() {
    if (!preview) return;
    onAdd(preview);
    setText('');
    setPreview(null);
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (preview) confirm();
      else interpret();
    } else if (e.key === 'Escape') {
      setPreview(null);
      setText('');
    }
  }

  const due = preview ? dueLabel(preview.due) : null;
  const colLabel = preview ? (COLUMNS.find(c => c.id === preview.col)?.label || preview.col) : '';

  return (
    <div className={`qadd ${thinking ? 'thinking' : ''}`}>
      <div className="qadd-row">
        <div className="qadd-glyph"><I.Sparkle /></div>
        <div style={{flex: 1, display:'flex', flexDirection:'column', gap: 2}}>
          <div className="qadd-label">Ask Eleanoreo</div>
          <input
            ref={ref}
            value={text}
            onChange={(e) => { setText(e.target.value); if (preview) setPreview(null); }}
            onKeyDown={onKey}
            placeholder={thinking ? 'Thinking…' : 'Tell me what you need to do — I\'ll figure out where it goes'}
          />
        </div>
      </div>
      {preview && (
        <div className="qadd-preview">
          <span className="qadd-preview-label">Eleanoreo suggests:</span>
          <span className="pill" style={{background:'rgba(146,138,255,0.18)', borderColor:'rgba(146,138,255,0.45)', color:'#CFCFFF'}}>
            <I.Sparkle /> {colLabel}
          </span>
          {due && <span className={`pill ${due.cls}`}><I.Clock />{due.label}</span>}
          <span style={{opacity:0.55, fontSize:11, fontStyle:'italic'}}>{preview.reasoning}</span>
          <button className="qadd-confirm" onClick={confirm}>Add task ↵</button>
        </div>
      )}
    </div>
  );
});

function dueLabel(d) {
  if (!d) return null;
  if (d === 'today')   return { label: 'Today',   cls: 'due-today' };
  if (d === 'tomorrow')return { label: 'Tomorrow',cls: '' };
  if (d === 'overdue') return { label: 'Overdue', cls: 'due-overdue' };
  if (d.startsWith('+')) return { label: 'In '+ d.slice(1), cls: '' };
  if (/^(mon|tue|wed|thu|fri|sat|sun)$/.test(d)) return { label: d[0].toUpperCase()+d.slice(1), cls: '' };
  return { label: d, cls: '' };
}

/* ============================================================
   Icons (inline, currentColor)
   ============================================================ */
const I = {
  Search:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4.35-4.35"/></svg>,
  Plus:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  Check:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Sparkle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/></svg>,
  Sun:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  Moon:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Clock:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Flag:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4a2 2 0 0 1 2-2h11l-2 5 2 5H6"/></svg>,
  More:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>,
  Star:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  StarFill:() => <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Filter:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>,
};

/* ============================================================
   App
   ============================================================ */
const ELEANOR_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "kanban",
  "density": "comfy",
  "glass": "full"
}/*EDITMODE-END*/;

function App() {
  const [tw, setTweak] = window.useTweaks ? window.useTweaks(ELEANOR_TWEAK_DEFAULTS) : [ELEANOR_TWEAK_DEFAULTS, () => {}];

  const [theme, setTheme] = useState('dark');
  const [tasks, setTasks] = useState(SEED);
  const [draftCol, setDraftCol] = useState(null);
  const [query, setQuery] = useState('');
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const quickRef = useRef(null);

  useEffect(() => { document.body.dataset.theme = theme; }, [theme]);

  // Glass intensity overrides via root CSS
  useEffect(() => {
    const root = document.documentElement;
    if (tw.glass === 'subtle')   root.style.setProperty('--glass-blur', 'blur(20px) saturate(120%)');
    else if (tw.glass === 'balanced') root.style.setProperty('--glass-blur', 'blur(28px) saturate(140%)');
    else                          root.style.setProperty('--glass-blur', 'blur(40px) saturate(160%)');
  }, [tw.glass]);

  // ⌘K focus search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        quickRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(t => t.text.toLowerCase().includes(q));
  }, [tasks, query]);

  const stats = useMemo(() => {
    const open = tasks.filter(t => !t.done);
    return {
      total: tasks.length,
      open: open.length,
      today: open.filter(t => t.due === 'today').length,
      overdue: open.filter(t => t.due === 'overdue').length,
    };
  }, [tasks]);

  function addTask({ text, priority, due, col }) {
    if (!text) return;
    const id = 'n' + Date.now() + Math.random().toString(36).slice(2,5);
    setTasks(s => [...s, {
      id, col: col || 'team', text,
      priority: priority || 'P2',
      due: due || null,
      done: false
    }]);
  }

  function onQuickAdd(e) {
    if (e.key !== 'Enter') return;
    const v = e.target.value.trim();
    if (!v) return;
    const parsed = parseNL(v);
    addTask(parsed);
    e.target.value = '';
  }

  function toggleDone(id) {
    setTasks(s => s.map(t => {
      if (t.id !== id) return t;
      if (t.col === 'done') {
        // restore to its prior bucket
        return { ...t, col: t.prevCol || 'team', done: false, prevCol: undefined };
      }
      return { ...t, prevCol: t.col, col: 'done', done: true };
    }));
  }
  function updateText(id, text) {
    setTasks(s => s.map(t => t.id === id ? {...t, text} : t));
  }
  function deleteTask(id) {
    setTasks(s => s.filter(t => t.id !== id));
  }
  function toggleStar(id) {
    setTasks(s => s.map(t => t.id === id ? {...t, starred: !t.starred} : t));
  }
  function cyclePriority(id) {
    // kept as no-op for back-compat
  }

  // Drag & drop
  function onDragStart(e, id) { setDragId(id); e.dataTransfer.effectAllowed = 'move'; }
  function onDragEnd() { setDragId(null); setDragOver(null); }
  function onColDragOver(e, colId) { e.preventDefault(); setDragOver(colId); }
  function onColDrop(e, colId) {
    e.preventDefault();
    if (!dragId) return;
    setTasks(s => {
      const moving = s.find(t => t.id === dragId);
      if (!moving) return s;
      const rest = s.filter(t => t.id !== dragId);
      // figure out drop position by mouse Y
      const els = e.currentTarget.querySelectorAll('.card');
      let insertBefore = null;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (e.clientY < r.top + r.height/2 && insertBefore === null) {
          insertBefore = el.dataset.id;
        }
      });
      const updated = {...moving, col: colId, done: colId === 'done', prevCol: colId === 'done' ? (moving.col === 'done' ? moving.prevCol : moving.col) : undefined};
      if (insertBefore && insertBefore !== dragId) {
        const out = [];
        for (const t of rest) {
          if (t.id === insertBefore) out.push(updated);
          out.push(t);
        }
        return out;
      }
      // append to col
      const colTasks = rest.filter(t => t.col === colId);
      const others = rest.filter(t => t.col !== colId);
      return [...others, ...colTasks, updated];
    });
    setDragId(null); setDragOver(null);
  }

  return (
    <div className="app">
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"></div>
          <div>
            <div className="brand-name"><em>Eleanoreo</em>List</div>
          </div>
          <span className="brand-version">v0.1 · edl</span>
        </div>

        <div className="search">
          <I.Search />
          <input id="search-input" placeholder="Search tasks…" value={query} onChange={e => setQuery(e.target.value)} />
          <kbd>⌘K</kbd>
        </div>

        <div className="top-actions">
          <button className="icon-btn" title="Filter"><I.Filter /></button>
          <button className="icon-btn" title="Toggle theme" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <I.Sun /> : <I.Moon />}
          </button>
          <button className="cta" onClick={() => quickRef.current?.focus()}>
            <I.Plus /> New task
          </button>
        </div>
      </div>

      {/* Page header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Hi Eleanor, <em>it's Wednesday, May 7</em>.</h1>
          <p className="page-sub">{stats.open} open · {stats.today} due today {stats.overdue ? '· ' + stats.overdue + ' overdue' : ''}</p>
        </div>
        <div className="stats">
          <div className="stat"><div className="stat-num">{stats.open}</div><div className="stat-lbl">Open</div></div>
          <div className="stat"><div className="stat-num">{stats.today}</div><div className="stat-lbl">Today</div></div>
          <div className="stat"><div className="stat-num" style={{color:'#FFBCC8'}}>{stats.overdue}</div><div className="stat-lbl">Overdue</div></div>
          <div className="stat"><div className="stat-num" style={{opacity:0.5}}>{stats.total - stats.open}</div><div className="stat-lbl">Done</div></div>
        </div>
      </div>

      {/* AI quick add */}
      <AIQuickAdd ref={quickRef} onAdd={addTask} />

      {/* Board */}
      <div className={`board ${tw.density === 'compact' ? 'compact' : ''} ${tw.layout === 'list' ? 'list' : ''}`}>
        {COLUMNS.map(col => {
          const items = filtered.filter(t => t.col === col.id);
          return (
            <div
              key={col.id}
              className={`col ${col.isDone ? 'col-done' : ''} ${dragOver === col.id ? 'drag-over' : ''}`}
              style={{ '--accent': col.accent }}
              onDragOver={(e) => onColDragOver(e, col.id)}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => onColDrop(e, col.id)}
            >
              <div className="col-head">
                <span className="col-dot"></span>
                <span className="col-title">{col.label}</span>
                <span className="col-count">{items.length}</span>
                <button className="col-add" title="Add to this list" onClick={() => {
                  const text = prompt(`New task for ${col.label}:`);
                  if (text) addTask({ text, col: col.id, priority: 'P2' });
                }}><I.Plus /></button>
              </div>

              <div className="cards">
                {items.length === 0 && <div className="empty">Drop a task here, or click +</div>}
                {items.map(task => (
                  <Card
                    key={task.id}
                    task={task}
                    accent={col.accent}
                    onToggle={() => toggleDone(task.id)}
                    onEdit={(text) => updateText(task.id, text)}
                    onDelete={() => deleteTask(task.id)}
                    onCyclePriority={() => toggleStar(task.id)}
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onDragEnd={onDragEnd}
                    dragging={dragId === task.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="foot">
        <span><kbd>⌘K</kbd> search</span>
        <span><kbd>⌘N</kbd> new task</span>
        <span><kbd>by friday</kbd> due date</span>
        <span><kbd>#team</kbd> <kbd>#leadership</kbd> <kbd>#house</kbd> <kbd>#personal</kbd> bucket</span>
      </div>

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Layout">
            <window.TweakRadio
              label="Layout"
              value={tw.layout}
              options={[
                { value: 'kanban', label: 'Kanban' },
                { value: 'list',   label: 'Stacked' },
              ]}
              onChange={(v) => setTweak('layout', v)}
            />
            <window.TweakRadio
              label="Density"
              value={tw.density}
              options={[
                { value: 'comfy',   label: 'Comfy' },
                { value: 'compact', label: 'Compact' },
              ]}
              onChange={(v) => setTweak('density', v)}
            />
          </window.TweakSection>
          <window.TweakSection title="Atmosphere">
            <window.TweakRadio
              label="Glass intensity"
              value={tw.glass}
              options={[
                { value: 'subtle',   label: 'Subtle' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'full',     label: 'Full' },
              ]}
              onChange={(v) => setTweak('glass', v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

function Card({ task, accent, onToggle, onEdit, onDelete, onCyclePriority, onDragStart, onDragEnd, dragging }) {
  const due = dueLabel(task.due);
  return (
    <div
      className={`card ${task.done ? 'done' : ''} ${task.starred ? 'starred' : ''} ${dragging ? 'dragging' : ''}`}
      draggable
      data-id={task.id}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="card-row1">
        <div className="check" style={{'--accent': accent}} onClick={onToggle}>
          <I.Check />
        </div>
        <div
          className="card-text"
          contentEditable
          suppressContentEditableWarning
          style={{paddingRight: '34px'}}
          onBlur={(e) => onEdit(e.target.textContent)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >{task.text}</div>
        <button
          className={`card-star ${task.starred ? 'on' : ''}`}
          onClick={onCyclePriority}
          title={task.starred ? 'Unstar' : 'Star'}
        >{task.starred ? <I.StarFill /> : <I.Star />}</button>
      </div>
      {due && (
        <div className="card-row2">
          <span className={`pill ${due.cls}`}><I.Clock />{due.label}</span>
        </div>
      )}
      <button className="card-menu" title="Delete" onClick={onDelete}><I.More /></button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
