import { useState } from 'react'
import type { CymaticsParams, PatternMode } from '../modes/types'
import './ControlPanel.css'

interface Props {
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

export default function ControlPanel({
  params,
  sensitivity,
  onParamChange,
  onSensitivityChange,
  onPreset,
  onReset,
}: Props) {
  const [openSections, setOpenSections] = useState({
    parameters: true,
    audio: true,
    colors: false,
  })

  const toggle = (section: keyof typeof openSections) => {
    setOpenSections(s => ({ ...s, [section]: !s[section] }))
  }

  return (
    <div className="control-panel">
      <div className="cp-header">
        <div className="cp-tabs">
          <button className="cp-tab cp-tab-active">Controls</button>
        </div>
      </div>

      <div className="cp-scroll">
        {/* Pattern Mode */}
        <div className="cp-mode-switcher">
          <button
            className={`cp-mode-btn ${params.patternMode === 'fixed' ? 'cp-mode-active' : ''}`}
            onClick={() => onParamChange('patternMode', 'fixed' as PatternMode)}
          >
            Fixed
          </button>
          <button
            className={`cp-mode-btn ${params.patternMode === 'adjustable' ? 'cp-mode-active' : ''}`}
            onClick={() => onParamChange('patternMode', 'adjustable' as PatternMode)}
          >
            Change Pattern
          </button>
        </div>

        {/* Audio Sync Section */}
        <section className="cp-section">
          <button className="cp-section-header" onClick={() => toggle('audio')}>
            <span className="cp-section-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </span>
            <span>Audio Sync</span>
            <span className="cp-chevron" data-open={openSections.audio}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          {openSections.audio && (
            <div className="cp-section-body">
              <div className="cp-control">
                <div className="cp-label-row">
                  <label>Input sensitivity</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sensitivity}
                  onChange={e => onSensitivityChange(parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}
        </section>

        {/* Parameters Section */}
        <section className="cp-section">
          <button className="cp-section-header" onClick={() => toggle('parameters')}>
            <span className="cp-section-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span>Parameters</span>
            <span className="cp-chevron" data-open={openSections.parameters}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          {openSections.parameters && (
            <div className="cp-section-body">
              <div className="cp-control">
                <div className="cp-label-row">
                  <label>Density</label>
                  <span className="cp-value">{params.density}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={params.density}
                  onChange={e => onParamChange('density', parseInt(e.target.value))}
                />
              </div>
              <div className="cp-control">
                <div className="cp-label-row">
                  <label>Frequency</label>
                  <span className="cp-value">{params.frequency}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={params.frequency}
                  onChange={e => onParamChange('frequency', parseInt(e.target.value))}
                />
              </div>
              <div className="cp-control">
                <div className="cp-label-row">
                  <label>Particle Size</label>
                  <span className="cp-value">{params.particleSize}PX</span>
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
            </div>
          )}
        </section>

        {/* Colors Section */}
        <section className="cp-section">
          <button className="cp-section-header" onClick={() => toggle('colors')}>
            <span className="cp-section-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </span>
            <span>Colors</span>
            <span className="cp-chevron" data-open={openSections.colors}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          {openSections.colors && (
            <div className="cp-section-body">
              <div className="cp-presets">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    className={`cp-preset-swatch ${
                      params.backgroundColor === preset.bg && params.particleColor === preset.particle
                        ? 'cp-preset-active' : ''
                    }`}
                    onClick={() => onPreset({ backgroundColor: preset.bg, particleColor: preset.particle })}
                    title={preset.name}
                  >
                    <div className="cp-swatch-preview" style={{ background: preset.bg }}>
                      <div className="cp-swatch-dot" style={{ background: preset.particle }} />
                    </div>
                    <span className="cp-swatch-label">{preset.name}</span>
                  </button>
                ))}
              </div>
              <div className="cp-color-inputs">
                <div className="cp-color-row">
                  <label>Background</label>
                  <input
                    type="color"
                    value={params.backgroundColor}
                    onChange={e => onParamChange('backgroundColor', e.target.value)}
                  />
                </div>
                <div className="cp-color-row">
                  <label>Particles</label>
                  <input
                    type="color"
                    value={params.particleColor}
                    onChange={e => onParamChange('particleColor', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <button className="cp-reset" onClick={onReset}>Reset all</button>
      </div>
    </div>
  )
}
