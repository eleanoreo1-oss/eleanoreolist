// Pure DOM confetti — no React needed, fires and cleans itself up

const CONFIGS = {
  team: {
    count: 90,
    type: 'sparkle',
    colors: ['#928AFF', '#5B43F2', '#B8B8FF', '#7418C1', '#CFCFFF', '#ffffff', '#E6E6FF', '#7E70FF'],
  },
  leadership: {
    count: 90,
    type: 'sparkle',
    colors: ['#FF69B4', '#EA04DF', '#928AFF', '#5B43F2', '#69E9FF', '#FFBCC8', '#C08AEE', '#F457FD', '#D9B8F7'],
  },
  life: {
    count: 60,
    type: 'emoji',
    emojis: ['🐱', '🐈', '🧶', '🐾', '🐈‍⬛', '😸', '🐱', '🧶', '🐾', '🐈'],
  },
};

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes confetti-fall {
      0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
      75%  { opacity: 1; }
      100% { transform: translate(var(--cx), 108vh) rotate(var(--cr)) scale(var(--cs)); opacity: 0; }
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
    const el = document.createElement('div');
    const x    = (Math.random() * 100).toFixed(1);
    const del  = (Math.random() * 0.7).toFixed(2);
    const dur  = (2.0 + Math.random() * 1.6).toFixed(2);
    const cx   = ((Math.random() - 0.5) * 200).toFixed(0);
    const cr   = (Math.random() * 900 - 450).toFixed(0);
    const cs   = (0.5 + Math.random() * 0.9).toFixed(2);

    if (cfg.type === 'sparkle') {
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      const size  = (5 + Math.random() * 10).toFixed(1);
      const r     = Math.random();
      // shapes: circle, square, rotated diamond, ✦ sparkle glyph
      if (r < 0.25) {
        // ✦ glyph
        el.textContent = '✦';
        el.style.cssText = `position:absolute;left:${x}%;top:-20px;font-size:${parseFloat(size)+6}px;color:${color};text-shadow:0 0 8px ${color};line-height:1;animation:confetti-fall ${dur}s ${del}s ease-in forwards;--cx:${cx}px;--cr:${cr}deg;--cs:${cs};`;
      } else {
        const br = r < 0.5 ? '50%' : r < 0.75 ? '3px' : '1px';
        const rot0 = r > 0.75 ? 'rotate(45deg)' : '';
        el.style.cssText = `position:absolute;left:${x}%;top:-12px;width:${size}px;height:${size}px;background:${color};border-radius:${br};transform-origin:center;box-shadow:0 0 ${parseFloat(size)*1.8}px ${color}99;animation:confetti-fall ${dur}s ${del}s ease-in forwards;--cx:${cx}px;--cr:${cr}deg;--cs:${cs};`;
        if (rot0) el.style.transform = rot0;
      }
    } else {
      const emoji = cfg.emojis[Math.floor(Math.random() * cfg.emojis.length)];
      const size  = (20 + Math.random() * 20).toFixed(0);
      el.textContent = emoji;
      el.style.cssText = `position:absolute;left:${x}%;top:-44px;font-size:${size}px;line-height:1;user-select:none;animation:confetti-fall ${dur}s ${del}s ease-in forwards;--cx:${cx}px;--cr:${cr}deg;--cs:${cs};`;
    }

    wrap.appendChild(el);
  }

  setTimeout(() => wrap.remove(), 5000);
}
