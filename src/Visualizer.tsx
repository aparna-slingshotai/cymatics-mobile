import { useRef, useEffect, useCallback } from 'react'
import { chladniCymatics } from './modes/chladniCymatics'
import type { AudioData, CymaticsParams } from './modes/types'

interface Props {
  getAudioData: () => AudioData
  params: CymaticsParams
  isActive: boolean
  onFocalPointMove: (index: number, x: number, y: number) => void
}

export default function Visualizer({ getAudioData, params, isActive, onFocalPointMove }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const getAudioDataRef = useRef(getAudioData)
  const isActiveRef = useRef(isActive)
  const paramsRef = useRef(params)
  const draggingRef = useRef<number | null>(null)

  getAudioDataRef.current = getAudioData
  isActiveRef.current = isActive
  paramsRef.current = params

  useEffect(() => {
    chladniCymatics.setParams(params)
  }, [params])

  const getCanvasCoords = useCallback((e: PointerEvent): { u: number; v: number } | null => {
    const container = containerRef.current
    if (!container) return null
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return { u: x / rect.width, v: y / rect.height }
  }, [])

  const findNearestFocal = useCallback((u: number, v: number): number | null => {
    const focals = paramsRef.current.focalPoints
    const threshold = 0.06
    let closest = -1
    let minDist = Infinity
    for (let i = 0; i < focals.length; i++) {
      const dx = u - focals[i].x
      const dy = v - focals[i].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < minDist && dist < threshold) {
        minDist = dist
        closest = i
      }
    }
    return closest >= 0 ? closest : null
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onPointerDown = (e: PointerEvent) => {
      if (paramsRef.current.patternMode !== 'adjustable') return
      const coords = getCanvasCoords(e)
      if (!coords) return
      const idx = findNearestFocal(coords.u, coords.v)
      if (idx !== null) {
        draggingRef.current = idx
        container.setPointerCapture(e.pointerId)
        e.preventDefault()
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (draggingRef.current === null) return
      const coords = getCanvasCoords(e)
      if (!coords) return
      const u = Math.max(0.02, Math.min(0.98, coords.u))
      const v = Math.max(0.02, Math.min(0.98, coords.v))
      onFocalPointMove(draggingRef.current, u, v)
      e.preventDefault()
    }

    const onPointerUp = () => {
      draggingRef.current = null
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
    container.addEventListener('pointercancel', onPointerUp)

    return () => {
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('pointercancel', onPointerUp)
    }
  }, [getCanvasCoords, findNearestFocal, onFocalPointMove])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const cw = rect.width
      const ch = rect.height
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const w = canvas.width / dpr
    const h = canvas.height / dpr
    chladniCymatics.init(w, h)

    let lastTime = 0
    let raf = 0

    const loop = (time: number) => {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016
      lastTime = time

      const cw = canvas.width / dpr
      const ch = canvas.height / dpr

      const audio = getAudioDataRef.current()
      chladniCymatics.update(audio, dt)
      chladniCymatics.draw(ctx, cw, ch)

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        touchAction: params.patternMode === 'adjustable' ? 'none' : 'auto',
        pointerEvents: params.patternMode === 'adjustable' ? 'auto' : 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  )
}
