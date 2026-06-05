import { useState, useCallback } from 'react'
import { useMicrophone } from './hooks/useMicrophone'
import { useParameters } from './hooks/useParameters'
import SettingsSheet from './components/SettingsSheet'
import PhoneUI from './components/PhoneUI'
import Visualizer from './Visualizer'
import './App.css'

export default function App() {
  const { start, stop, getAudioData, isActive, setSensitivity } = useMicrophone()
  const { params, setParam, reset, setPreset, moveFocalPoint } = useParameters()
  const [sensitivity, setSensitivityState] = useState(0.7)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleSensitivityChange = useCallback((value: number) => {
    setSensitivityState(value)
    setSensitivity(value)
  }, [setSensitivity])

  const handleToggleMute = useCallback(() => {
    setParam('muted', !params.muted)
  }, [params.muted, setParam])

  return (
    <div className="app-mobile">
      <Visualizer
        getAudioData={getAudioData}
        params={params}
        isActive={isActive}
        onFocalPointMove={moveFocalPoint}
      />
      <PhoneUI
        isActive={isActive}
        isMuted={params.muted}
        onStart={start}
        onStop={stop}
        onToggleMute={handleToggleMute}
        onSettingsOpen={() => setSettingsOpen(true)}
      />
      <SettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        params={params}
        sensitivity={sensitivity}
        onParamChange={setParam}
        onSensitivityChange={handleSensitivityChange}
        onPreset={setPreset}
        onReset={reset}
      />
    </div>
  )
}
