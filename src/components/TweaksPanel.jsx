import { useState } from 'react';
import { SlidersH } from '../icons.jsx';

function SegControl({ options, value, onChange }) {
  return (
    <div className="tweak-seg">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`tweak-seg-btn${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function TweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
          width: 36, height: 36, borderRadius: 10,
          display: 'grid', placeItems: 'center',
          background: 'rgba(91,67,242,0.80)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: '#fff', cursor: 'pointer', padding: 0,
          boxShadow: '0 6px 18px rgba(54,17,200,0.45)',
        }}
        onClick={() => setOpen(true)}
        title="Open tweaks"
      >
        <SlidersH />
      </button>
    );
  }

  return (
    <div className="tweaks-panel">
      <div className="tweaks-header">
        <span>Tweaks</span>
        <button className="tweaks-close" onClick={() => setOpen(false)}>×</button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-section">Layout</div>
        <div className="tweak-row">
          <div className="tweak-label">Layout</div>
          <SegControl
            value={tweaks.layout}
            options={[{ value: 'kanban', label: 'Kanban' }, { value: 'list', label: 'Stacked' }]}
            onChange={v => setTweak('layout', v)}
          />
        </div>
        <div className="tweak-row">
          <div className="tweak-label">Density</div>
          <SegControl
            value={tweaks.density}
            options={[{ value: 'comfy', label: 'Comfy' }, { value: 'compact', label: 'Compact' }]}
            onChange={v => setTweak('density', v)}
          />
        </div>
        <div className="tweak-section">Atmosphere</div>
        <div className="tweak-row">
          <div className="tweak-label">Glass intensity</div>
          <SegControl
            value={tweaks.glass}
            options={[
              { value: 'subtle', label: 'Subtle' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'full', label: 'Full' },
            ]}
            onChange={v => setTweak('glass', v)}
          />
        </div>
      </div>
    </div>
  );
}
