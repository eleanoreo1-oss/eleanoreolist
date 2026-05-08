/* === tweaks-panel.jsx === */

// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', noDeckControls = false, children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(
    () => typeof document !== 'undefined' && !!document.querySelector('deck-stage'),
    [],
  );
  // Hide the toggle until the host has actually enabled the rail (the
  // __omelette_rail_enabled window message, posted only when the
  // omelette_deck_rail_enabled flag is on for this user). The initial read
  // covers TweaksPanel mounting after the message already arrived; the
  // listener covers the common case of mounting first.
  const [railEnabled, setRailEnabled] = React.useState(
    () => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled,
  );
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = (e) => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try { return localStorage.getItem('deck-stage.railVisible') !== '0'; } catch (e) { return true; }
  });
  const toggleRail = (on) => {
    setRailVisible(on);
    window.postMessage({ type: '__deck_rail_visible', on }, '*');
  };
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-noncommentable=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
          {hasDeckStage && railEnabled && !noDeckControls && (
            <TweakSection label="Deck">
              <TweakToggle label="Thumbnail rail" value={railVisible} onChange={toggleRail} />
            </TweakSection>
          )}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});


/* === EleanoreoList.app.jsx === */
/* EleanoreoList — main app */
const { useState, useEffect, useRef, useMemo } = React;

const COLUMNS = [
  { id: 'team',       label: 'Enterprise Team',       short: 'Team',       accent: '#5B43F2' },
  { id: 'leadership', label: 'Leadership Initiatives', short: 'Leadership', accent: '#25D1F4' },
  { id: 'house',      label: 'Housekeeping',          short: 'Housekeeping', accent: '#FDBE00' },
  { id: 'personal',   label: 'Personal',              short: 'Personal',   accent: '#F457FD' },
];

const SEED = [
  { id: 't1', col: 'team',       text: 'Write email to Bobby re: Q2 platform roadmap', priority: 'P1', due: 'today',     done: false },
  { id: 't2', col: 'team',       text: 'Finish calibration guide for Meghan',           priority: 'P0', due: 'tomorrow',  done: false },
  { id: 't3', col: 'team',       text: 'Review tooling team OKRs',                      priority: 'P2', due: null,        done: true  },
  { id: 't4', col: 'leadership', text: 'Empathy museum buildout — phase 2 brief',       priority: 'P1', due: '+3d',       done: false },
  { id: 't5', col: 'leadership', text: 'Prep talking points for Wednesday all-hands',   priority: 'P1', due: 'tomorrow',  done: false },
  { id: 't6', col: 'leadership', text: 'Sponsor: internal AI guild proposal',           priority: 'P2', due: null,        done: false },
  { id: 't7', col: 'house',      text: 'Inquire about taxes',                           priority: 'P2', due: '+5d',       done: false },
  { id: 't8', col: 'house',      text: 'Renew laptop loaner for the team',              priority: 'P2', due: null,        done: false },
  { id: 't9', col: 'house',      text: 'Approve travel for offsite',                    priority: 'P1', due: 'overdue',   done: false },
  { id: 't10', col: 'personal',  text: 'Book dentist',                                  priority: 'P2', due: null,        done: false },
  { id: 't11', col: 'personal',  text: 'Pick up dry cleaning',                          priority: 'P2', due: 'today',     done: false },
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

  // Bucket: #team #leadership #house #personal (and aliases)
  const cMatch = text.match(/(?:^|\s)#(team|leadership|house(?:keeping)?|personal|enterprise)\b/i);
  if (cMatch) {
    const c = cMatch[1].toLowerCase();
    col = c.startsWith('house') ? 'house'
        : c.startsWith('lead') ? 'leadership'
        : c.startsWith('person') ? 'personal'
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
  const t = window.useTweaks ? window.useTweaks(ELEANOR_TWEAK_DEFAULTS) : { tweaks: ELEANOR_TWEAK_DEFAULTS, setTweak: () => {} };
  const tw = t.tweaks;

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
    setTasks(s => s.map(t => t.id === id ? {...t, done: !t.done} : t));
  }
  function updateText(id, text) {
    setTasks(s => s.map(t => t.id === id ? {...t, text} : t));
  }
  function deleteTask(id) {
    setTasks(s => s.filter(t => t.id !== id));
  }
  function cyclePriority(id) {
    const order = ['P0','P1','P2'];
    setTasks(s => s.map(t => t.id === id ? {...t, priority: order[(order.indexOf(t.priority)+1) % 3]} : t));
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
      const updated = {...moving, col: colId};
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
          <h1 className="page-title">Hey — here's <em>what's on</em>.</h1>
          <p className="page-sub">Wednesday, May 7 · {stats.open} open · {stats.today} due today {stats.overdue ? '· ' + stats.overdue + ' overdue' : ''}</p>
        </div>
        <div className="stats">
          <div className="stat"><div className="stat-num">{stats.open}</div><div className="stat-lbl">Open</div></div>
          <div className="stat"><div className="stat-num" style={{color:'#CFCFFF'}}>{stats.today}</div><div className="stat-lbl">Today</div></div>
          <div className="stat"><div className="stat-num" style={{color:'#FFBCC8'}}>{stats.overdue}</div><div className="stat-lbl">Overdue</div></div>
          <div className="stat"><div className="stat-num" style={{color:'#C2FEDB'}}>{stats.total - stats.open}</div><div className="stat-lbl">Done</div></div>
        </div>
      </div>

      {/* Quick add */}
      <div className="qadd">
        <div className="qadd-glyph"><I.Sparkle /></div>
        <input
          ref={quickRef}
          placeholder="Add a task — try: 'Write Q2 brief by friday !p1 #leadership'"
          onKeyDown={onQuickAdd}
        />
        <span className="qadd-hint"><I.Plus /> Press Enter</span>
      </div>

      {/* Board */}
      <div className={`board ${tw.density === 'compact' ? 'compact' : ''} ${tw.layout === 'list' ? 'list' : ''}`}>
        {COLUMNS.map(col => {
          const items = filtered.filter(t => t.col === col.id);
          return (
            <div
              key={col.id}
              className={`col ${dragOver === col.id ? 'drag-over' : ''}`}
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
                    onCyclePriority={() => cyclePriority(task.id)}
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
        <span><kbd>!p0</kbd> <kbd>!p1</kbd> <kbd>!p2</kbd> priority</span>
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
              onChange={(v) => t.setTweak('layout', v)}
            />
            <window.TweakRadio
              label="Density"
              value={tw.density}
              options={[
                { value: 'comfy',   label: 'Comfy' },
                { value: 'compact', label: 'Compact' },
              ]}
              onChange={(v) => t.setTweak('density', v)}
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
              onChange={(v) => t.setTweak('glass', v)}
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
      className={`card ${task.done ? 'done' : ''} ${dragging ? 'dragging' : ''}`}
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
          onBlur={(e) => onEdit(e.target.textContent)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
        >{task.text}</div>
        <button className="card-menu" title="Delete" onClick={onDelete}><I.More /></button>
      </div>
      <div className="card-row2">
        <span
          className={`pill ${task.priority.toLowerCase()}`}
          onClick={onCyclePriority}
          style={{cursor:'pointer'}}
          title="Click to cycle priority"
        ><I.Flag />{task.priority}</span>
        {due && <span className={`pill ${due.cls}`}><I.Clock />{due.label}</span>}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
