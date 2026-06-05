import { useRef, useState, useCallback, useEffect } from 'react'
import { analyzeAudio, resetAnalysis } from '../audioAnalysis'
import type { AudioData } from '../modes/types'

const SILENT_AUDIO: AudioData = {
  bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0,
  volume: 0, isBeat: false,
  frequencyBins: new Uint8Array(128),
  timeDomain: new Uint8Array(128),
}

export function useMicrophone() {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const freqBuf = useRef(new Uint8Array(128))
  const timeBuf = useRef(new Uint8Array(128))
  const audioDataRef = useRef<AudioData>({ ...SILENT_AUDIO })

  const start = useCallback(async () => {
    try {
      setError(null)

      // Create AudioContext first (must happen in user gesture on iOS)
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.3
      analyserRef.current = analyser

      const gain = ctx.createGain()
      gain.gain.value = 1.0
      gainRef.current = gain

      const source = ctx.createMediaStreamSource(stream)
      source.connect(gain)
      gain.connect(analyser)
      sourceRef.current = source

      resetAnalysis()
      setIsActive(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microphone access denied')
      setIsActive(false)
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    sourceRef.current?.disconnect()
    gainRef.current?.disconnect()
    analyserRef.current?.disconnect()
    streamRef.current = null
    sourceRef.current = null
    analyserRef.current = null
    gainRef.current = null
    audioDataRef.current = { ...SILENT_AUDIO }
    resetAnalysis()
    setIsActive(false)
  }, [])

  const setSensitivity = useCallback((value: number) => {
    if (gainRef.current) {
      gainRef.current.gain.value = value * 3
    }
  }, [])

  const getAudioData = useCallback((): AudioData => {
    const analyser = analyserRef.current
    if (!analyser || !isActive) return audioDataRef.current

    analyser.getByteFrequencyData(freqBuf.current)
    analyser.getByteTimeDomainData(timeBuf.current)
    audioDataRef.current = analyzeAudio(freqBuf.current, timeBuf.current)
    return audioDataRef.current
  }, [isActive])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioCtxRef.current?.close()
    }
  }, [])

  return { start, stop, getAudioData, isActive, error, setSensitivity }
}
