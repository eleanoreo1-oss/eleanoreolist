// Pure DOM confetti — no React needed, fires and cleans itself up

const CONFIGS = {
  team: {
    count: 80,
    type: 'sparkle',
    colors: ['#928AFF', '#5B43F2', '#B8B8FF', '#7418C1', '#CFCFFF', '#ffffff', '#E6E6FF', '#7E70FF'],
  },
  leadership: {
    count: 18,
    type: 'text',
    messages: ['you go girl', 'woo, eleanor', 'hell yeah', 'crushed it, babe', 'you did done did it', 'boss lady fo realz'],
    colors: ['#FF69B4', '#EA04DF', '#928AFF', '#F457FD', '#FFBCC8', '#C08AEE'],
  },
  life: {
    count: 55,
    type: 'emoji',
    emojis: ['🐱', '🧶', '🐾'],
  },
};

// 4-pointed sparkle path (100×100 viewBox) — concave bezier sides like the reference image
const SPARKLE_PATH = 'M50 0Q53 47 100 50Q53 53 50 100Q47 53 0 50Q47 47 50 0Z';

function makeSparkleSVG(size, color) {
  const ns  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width',  size);
  svg.setAttribute('height', size);
  svg.style.overflow = 'visible';

  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', SPARKLE_PATH);
  path.setAttribute('fill', color);

  // Soft glow
  const defs   = document.createElementNS(ns, 'defs');
  const filter = document.createElementNS(ns, 'filter');
  const fid    = 'g' + Math.random().toString(36).slice(2, 6);
  filter.setAttribute('id', fid);
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');
  const blur = document.createElementNS(ns, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '6');
  blur.setAttribute('result', 'b');
  const merge = document.createElementNS(ns, 'feMerge');
  ['b', 'SourceGraphic'].forEach(i => {
    const n = document.createElementNS(ns, 'feMergeNode');
    if (i === 'b') n.setAttribute('in', i);
    merge.appendChild(n);
  });
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);
  path.setAttribute('filter', `url(#${fid})`);
  svg.appendChild(path);
  return svg;
}

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes confetti-fall {
      0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
      80%  { opacity: 1; }
      100% { transform: translate(var(--cx), 110vh) rotate(var(--cr)) scale(var(--cs)); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

export function launchConfetti(colId) {
  const cfg = CONFIGS[colId];
  if (!cfg) return;
  injectCSS();

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;';
  document.body.appendChild(wrap);

  for (let i = 0; i < cfg.count; i++) {
    const x   = (Math.random() * 100).toFixed(1);
    const del = (Math.random() * 0.9).toFixed(2);
    const dur = (3.2 + Math.random() * 1.8).toFixed(2);   // slower
    const cx  = ((Math.random() - 0.5) * 180).toFixed(0);
    const cr  = (Math.random() * 720 - 360).toFixed(0);
    const cs  = (0.5 + Math.random() * 0.8).toFixed(2);

    let el;

    if (cfg.type === 'sparkle') {
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      const size  = Math.round(10 + Math.random() * 16);

      el = document.createElement('div');
      el.style.cssText = `position:absolute;left:${x}%;top:-${size+4}px;width:${size}px;height:${size}px;`;
      el.appendChild(makeSparkleSVG(size, color));
    } else if (cfg.type === 'text') {
      const msg   = cfg.messages[Math.floor(Math.random() * cfg.messages.length)];
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      const size  = Math.round(13 + Math.random() * 8);

      el = document.createElement('div');
      el.textContent = msg;
      el.style.cssText = `position:absolute;left:${x}%;top:-40px;font-size:${size}px;font-weight:700;font-family:sans-serif;white-space:nowrap;user-select:none;color:${color};text-shadow:0 1px 6px rgba(0,0,0,0.35);`;
    } else {
      const emoji = cfg.emojis[Math.floor(Math.random() * cfg.emojis.length)];
      const size  = Math.round(22 + Math.random() * 20);

      el = document.createElement('div');
      el.textContent = emoji;
      el.style.cssText = `position:absolute;left:${x}%;top:-48px;font-size:${size}px;line-height:1;user-select:none;`;
    }

    el.style.animation = `confetti-fall ${dur}s ${del}s ease-in forwards`;
    el.style.setProperty('--cx', `${cx}px`);
    el.style.setProperty('--cr', `${cr}deg`);
    el.style.setProperty('--cs', cs);

    wrap.appendChild(el);
  }

  setTimeout(() => wrap.remove(), 6500);
}
