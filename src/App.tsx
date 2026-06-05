import { useState, useCallback } from 'react'
import { useMicrophone } from './hooks/useMicrophone'
import { useParameters } from './hooks/useParameters'
import ControlPanel from './components/ControlPanel'
import PhoneMockup from './components/PhoneMockup'
import PhoneUI from './components/PhoneUI'
import Visualizer from './Visualizer'
import './App.css'

export default function App() {
  const { start, stop, getAudioData, isActive, setSensitivity } = useMicrophone()
  const { params, setParam, reset, setPreset, moveFocalPoint } = useParameters()
  const [sensitivity, setSensitivityState] = useState(0.7)

  const handleSensitivityChange = useCallback((value: number) => {
    setSensitivityState(value)
    setSensitivity(value)
  }, [setSensitivity])

  return (
    <div className="app-layout">
      <ControlPanel
        params={params}
        sensitivity={sensitivity}
        onParamChange={setParam}
        onSensitivityChange={handleSensitivityChange}
        onPreset={setPreset}
        onReset={reset}
      />
      <main className="app-main">
        <PhoneMockup>
          <Visualizer
            getAudioData={getAudioData}
            params={params}
            isActive={isActive}
            onFocalPointMove={moveFocalPoint}
          />
          <PhoneUI
            isActive={isActive}
            onStart={start}
            onStop={stop}
          />
        </PhoneMockup>
      </main>
    </div>
  )
}
