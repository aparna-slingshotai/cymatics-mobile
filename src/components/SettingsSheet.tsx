import type { CymaticsParams, PatternMode } from '../modes/types'
import './SettingsSheet.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  params: CymaticsParams
  sensitivity: number
  onParamChange: <K extends keyof CymaticsParams>(key: K, value: CymaticsParams[K]) => void
  onSensitivityChange: (value: number) => void
  onPreset: (preset: Partial<CymaticsParams>) => void
  onReset: () => void
}

const COLOR_PRESETS = [
  { name: 'Earth', bg: '#F5F0EA', particle: '#5C4633' },
  { name: 'Midnight', bg: '#0a0a0f', particle: '#c8ff00' },
  { name: 'Ocean', bg: '#0d1b2a', particle: '#48cae4' },
  { name: 'Rose', bg: '#fff0f3', particle: '#c9184a' },
  { name: 'Mono', bg: '#ffffff', particle: '#1a1a1a' },
  { name: 'Ember', bg: '#1a0a00', particle: '#ff6b35' },
]

export default function SettingsSheet({
  isOpen,
  onClose,
  params,
  sensitivity,
  onParamChange,
  onSensitivityChange,
  onPreset,
  onReset,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="ss-overlay" onClick={onClose}>
      <div className="ss-sheet" onClick={e => e.stopPropagation()}>
        <div className="ss-handle" />

        <div className="ss-header">
          <h2>Settings</h2>
          <button className="ss-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="ss-body">
          {/* Mode */}
          <div className="ss-mode">
            <button
              className={`ss-mode-btn ${params.patternMode === 'fixed' ? 'ss-mode-active' : ''}`}
              onClick={() => onParamChange('patternMode', 'fixed' as PatternMode)}
            >
              Fixed
            </button>
            <button
              className={`ss-mode-btn ${params.patternMode === 'adjustable' ? 'ss-mode-active' : ''}`}
              onClick={() => onParamChange('patternMode', 'adjustable' as PatternMode)}
            >
              Change Pattern
            </button>
          </div>

          {/* Sensitivity */}
          <div className="ss-control">
            <label>Input sensitivity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sensitivity}
              onChange={e => onSensitivityChange(parseFloat(e.target.value))}
            />
          </div>

          {/* Parameters */}
          <div className="ss-control">
            <div className="ss-label-row">
              <label>Density</label>
              <span>{params.density}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={params.density}
              onChange={e => onParamChange('density', parseInt(e.target.value))}
            />
          </div>

          <div className="ss-control">
            <div className="ss-label-row">
              <label>Frequency</label>
              <span>{params.frequency}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={params.frequency}
              onChange={e => onParamChange('frequency', parseInt(e.target.value))}
            />
          </div>

          <div className="ss-control">
            <div className="ss-label-row">
              <label>Particle Size</label>
              <span>{params.particleSize}PX</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={params.particleSize}
              onChange={e => onParamChange('particleSize', parseFloat(e.target.value))}
            />
          </div>

          {/* Colors */}
          <div className="ss-colors">
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset.name}
                className={`ss-swatch ${
                  params.backgroundColor === preset.bg && params.particleColor === preset.particle
                    ? 'ss-swatch-active' : ''
                }`}
                onClick={() => onPreset({ backgroundColor: preset.bg, particleColor: preset.particle })}
              >
                <div className="ss-swatch-preview" style={{ background: preset.bg }}>
                  <div className="ss-swatch-dot" style={{ background: preset.particle }} />
                </div>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          <button className="ss-reset" onClick={onReset}>Reset all</button>
        </div>
      </div>
    </div>
  )
}
