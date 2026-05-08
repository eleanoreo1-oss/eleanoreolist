export const COLUMNS = [
  { id: 'team',       label: 'Enterprise Team',        short: 'Team',       accent: '#928AFF' },
  { id: 'leadership', label: 'Leadership Initiatives',  short: 'Leadership', accent: '#928AFF' },
  { id: 'life',       label: 'Life & Housekeeping',    short: 'Life',       accent: '#928AFF' },
  { id: 'done',       label: 'Completed',              short: 'Done',       accent: '#5B5870', isDone: true },
];

export const SEED_TASKS = [
  { id: 't1',  col: 'team',       text: 'Write email to Bobby re: Q2 platform roadmap',  due: 'today',    done: false, starred: true },
  { id: 't2',  col: 'team',       text: 'Finish calibration guide for Meghan',            due: 'tomorrow', done: false, starred: true },
  { id: 't3',  col: 'done',       text: 'Review tooling team OKRs',                       due: null,       done: true,  prevCol: 'team' },
  { id: 't4',  col: 'leadership', text: 'Empathy museum buildout — phase 2 brief',        due: '+3d',      done: false, starred: true },
  { id: 't5',  col: 'leadership', text: 'Prep talking points for Wednesday all-hands',    due: 'tomorrow', done: false },
  { id: 't6',  col: 'leadership', text: 'Sponsor: internal AI guild proposal',            due: null,       done: false },
  { id: 't7',  col: 'life',       text: 'Inquire about taxes',                            due: '+5d',      done: false },
  { id: 't8',  col: 'life',       text: 'Approve travel for offsite',                     due: 'overdue',  done: false, starred: true },
  { id: 't9',  col: 'life',       text: 'Renew laptop loaner for the team',               due: null,       done: false },
  { id: 't10', col: 'life',       text: 'Book dentist',                                   due: null,       done: false },
  { id: 't11', col: 'life',       text: 'Pick up dry cleaning',                           due: 'today',    done: false },
];

export function dueLabel(d) {
  if (!d) return null;
  if (d === 'today')    return { label: 'Today',   cls: 'due-today' };
  if (d === 'tomorrow') return { label: 'Tomorrow', cls: '' };
  if (d === 'overdue')  return { label: 'Overdue',  cls: 'due-overdue' };
  if (d.startsWith('+')) return { label: 'In ' + d.slice(1), cls: '' };
  if (/^(mon|tue|wed|thu|fri|sat|sun)$/.test(d)) return { label: d[0].toUpperCase() + d.slice(1), cls: '' };
  return { label: d, cls: '' };
}

export function parseNL(input) {
  let text = input;
  let due = null;
  let col = null;

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
    else due = v.slice(0, 3);
    text = text.replace(dMatch[0], ' ');
  }

  text = text.replace(/\s+/g, ' ').trim();
  return { text, due, col };
}

export function makeid() {
  return 'n' + Date.now() + Math.random().toString(36).slice(2, 5);
}
