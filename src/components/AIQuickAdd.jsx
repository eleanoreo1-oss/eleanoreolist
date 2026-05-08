import { useState, forwardRef } from 'react';
import { Sparkle, Clock } from '../icons.jsx';
import { COLUMNS, dueLabel, parseNL } from '../data.js';

const AIQuickAdd = forwardRef(function AIQuickAdd({ onAdd }, ref) {
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [preview, setPreview] = useState(null);

  async function interpret() {
    const v = text.trim();
    if (!v) return;
    setThinking(true);
    setPreview(null);

    try {
      const prompt = `You are a task triage assistant for Eleanor's personal kanban board.
She has 3 buckets:
  - "team": Enterprise Team (her direct reports, eng & design tooling work)
  - "leadership": Leadership Initiatives (cross-org, exec, big-bet projects)
  - "life": Life & Housekeeping (admin, taxes, errands, personal appointments)

Given this user input, return ONLY a single-line JSON object with these keys:
  text: cleaned task title (no priority/date markers, imperative voice)
  col: one of "team" | "leadership" | "life"
  due: one of "today" | "tomorrow" | "+Nd" (N days) | "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun" | null
  reasoning: 4-7 word justification of bucket choice

Input: ${JSON.stringify(v)}

Respond with ONLY the JSON, no prose, no code fences.`;

      // window.claude is available when running inside Claude Design
      if (window.claude?.complete) {
        const raw = await window.claude.complete(prompt);
        const cleaned = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
        setPreview(JSON.parse(cleaned));
      } else {
        throw new Error('no claude');
      }
    } catch {
      const local = parseNL(v);
      setPreview({ ...local, col: local.col || 'team', reasoning: 'Local parse' });
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
    <div className={`qadd${thinking ? ' thinking' : ''}`}>
      <div className="qadd-row">
        <div className="qadd-glyph"><Sparkle /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="qadd-label">Ask Eleanoreo</div>
          <input
            ref={ref}
            value={text}
            onChange={e => { setText(e.target.value); if (preview) setPreview(null); }}
            onKeyDown={onKey}
            placeholder={thinking ? 'Thinking…' : "Tell me what you need to do — I'll figure out where it goes"}
          />
        </div>
      </div>
      {preview && (
        <div className="qadd-preview">
          <span className="qadd-preview-label">Eleanoreo suggests:</span>
          <span className="pill" style={{ background: 'rgba(146,138,255,0.18)', borderColor: 'rgba(146,138,255,0.45)', color: '#CFCFFF' }}>
            <Sparkle /> {colLabel}
          </span>
          {due && <span className={`pill${due.cls ? ' ' + due.cls : ''}`}><Clock />{due.label}</span>}
          {preview.reasoning && <span style={{ opacity: 0.55, fontSize: 11, fontStyle: 'italic' }}>{preview.reasoning}</span>}
          <button className="qadd-confirm" onClick={confirm}>Add task ↵</button>
        </div>
      )}
    </div>
  );
});

export default AIQuickAdd;
