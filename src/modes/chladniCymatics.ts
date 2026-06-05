import type { AudioData, CymaticsParams, FocalPoint, ParameterizedMode } from './types'
import { DEFAULT_PARAMS } from './types'

let xs: Float32Array
let ys: Float32Array
let vxs: Float32Array
let vys: Float32Array
let w = 0
let h = 0
let particleCount = 0
let params: CymaticsParams = { ...DEFAULT_PARAMS }
let needsReinit = false
let wasMuted = false

function mapDensity(d: number): number {
  return Math.round(500 + (d / 100) * 7500)
}

// --- Fixed mode: Chladni plate equation ---

function chladniVal(u: number, v: number, n: number, m: number): number {
  return Math.sin(n * Math.PI * u) * Math.sin(m * Math.PI * v) +
         Math.sin(m * Math.PI * u) * Math.sin(n * Math.PI * v)
}

function chladniDU(u: number, v: number, n: number, m: number): number {
  return n * Math.PI * Math.cos(n * Math.PI * u) * Math.sin(m * Math.PI * v) +
         m * Math.PI * Math.cos(m * Math.PI * u) * Math.sin(n * Math.PI * v)
}

function chladniDV(u: number, v: number, n: number, m: number): number {
  return m * Math.PI * Math.sin(n * Math.PI * u) * Math.cos(m * Math.PI * v) +
         n * Math.PI * Math.sin(m * Math.PI * u) * Math.cos(n * Math.PI * v)
}

function mapFrequency(f: number): [number, number] {
  const n = Math.max(1, Math.ceil(f / 4))
  const m = Math.max(1, ((f - 1) % 4) + 1)
  return [n, m]
}

// --- Adjustable mode: wave interference from focal points ---

function waveField(px: number, py: number, focals: FocalPoint[], k: number): number {
  let val = 0
  for (let i = 0; i < focals.length; i++) {
    const fx = focals[i].x * w
    const fy = focals[i].y * h
    const dx = px - fx
    const dy = py - fy
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
    val += Math.sin(k * dist)
  }
  return val
}

function waveGrad(px: number, py: number, focals: FocalPoint[], k: number): [number, number] {
  let gx = 0
  let gy = 0
  for (let i = 0; i < focals.length; i++) {
    const fx = focals[i].x * w
    const fy = focals[i].y * h
    const dx = px - fx
    const dy = py - fy
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
    const c = k * Math.cos(k * dist) / dist
    gx += c * dx
    gy += c * dy
  }
  return [gx, gy]
}

// --- Shared ---

function initParticles(count: number) {
  particleCount = count
  xs = new Float32Array(particleCount)
  ys = new Float32Array(particleCount)
  vxs = new Float32Array(particleCount)
  vys = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    xs[i] = Math.random() * w
    ys[i] = Math.random() * h
    vxs[i] = 0
    vys[i] = 0
  }
}

function updateFixed(audio: AudioData, _dt: number) {
  const [n, m] = mapFrequency(params.frequency)

  const vol = audio.volume * params.inputSensitivity * 3
  const noiseAmt = 0.02 + vol * 6
  const beatAmt = audio.isBeat ? 20 : 0

  for (let i = 0; i < particleCount; i++) {
    const u = xs[i] / w
    const v = ys[i] / h
    const f = chladniVal(u, v, n, m)
    const du = chladniDU(u, v, n, m)
    const dv = chladniDV(u, v, n, m)

    const gradMag = Math.sqrt(du * du + dv * dv) + 0.0001

    xs[i] -= (f * du / gradMag) * 6
    ys[i] -= (f * dv / gradMag) * 6

    xs[i] += (Math.random() - 0.5) * noiseAmt
    ys[i] += (Math.random() - 0.5) * noiseAmt

    if (beatAmt > 0) {
      xs[i] += (Math.random() - 0.5) * beatAmt
      ys[i] += (Math.random() - 0.5) * beatAmt
    }

    if (xs[i] < 0) xs[i] = 0
    if (xs[i] > w) xs[i] = w
    if (ys[i] < 0) ys[i] = 0
    if (ys[i] > h) ys[i] = h
  }
}

function updateAdjustable(audio: AudioData, _dt: number) {
  const focals = params.focalPoints
  const k = params.frequency * 0.12

  const vol = audio.volume * params.inputSensitivity * 3
  const noiseAmt = 0.02 + vol * 6
  const beatAmt = audio.isBeat ? 20 : 0

  for (let i = 0; i < particleCount; i++) {
    const f = waveField(xs[i], ys[i], focals, k)
    const [gx, gy] = waveGrad(xs[i], ys[i], focals, k)

    const gradMag = Math.sqrt(gx * gx + gy * gy) + 0.0001

    xs[i] -= (f * gx / gradMag) * 6
    ys[i] -= (f * gy / gradMag) * 6

    xs[i] += (Math.random() - 0.5) * noiseAmt
    ys[i] += (Math.random() - 0.5) * noiseAmt

    if (beatAmt > 0) {
      xs[i] += (Math.random() - 0.5) * beatAmt
      ys[i] += (Math.random() - 0.5) * beatAmt
    }

    if (xs[i] < 0) xs[i] = 0
    if (xs[i] > w) xs[i] = w
    if (ys[i] < 0) ys[i] = 0
    if (ys[i] > h) ys[i] = h
  }
}

function updateGravity(dt: number) {
  const gravity = 0.4
  const bounceDamping = 0.3
  const floor = h - 2

  for (let i = 0; i < particleCount; i++) {
    vys[i] += gravity
    vxs[i] += (Math.random() - 0.5) * 0.15
    vxs[i] *= 0.99
    vys[i] *= 0.99

    xs[i] += vxs[i] * dt * 60
    ys[i] += vys[i] * dt * 60

    if (ys[i] >= floor) {
      ys[i] = floor
      vys[i] *= -bounceDamping
      vxs[i] *= 0.95
      if (Math.abs(vys[i]) < 0.3) vys[i] = 0
    }

    if (xs[i] < 0) { xs[i] = 0; vxs[i] *= -0.5 }
    if (xs[i] > w) { xs[i] = w; vxs[i] *= -0.5 }
    if (ys[i] < 0) { ys[i] = 0; vys[i] *= -0.5 }
  }
}

export const chladniCymatics: ParameterizedMode = {
  setParams(p: CymaticsParams) {
    const newCount = mapDensity(p.density)
    if (newCount !== particleCount && w > 0 && h > 0) {
      needsReinit = true
    }
    params = p
  },

  init(width: number, height: number) {
    w = width
    h = height
    if (w > 0 && h > 0) {
      initParticles(mapDensity(params.density))
    }
  },

  update(audio: AudioData, dt: number) {
    if (w === 0 || h === 0) return

    if (needsReinit) {
      initParticles(mapDensity(params.density))
      needsReinit = false
    }

    if (!params.muted && wasMuted) {
      for (let i = 0; i < particleCount; i++) {
        xs[i] = Math.random() * w
        ys[i] = Math.random() * h
        vxs[i] = (Math.random() - 0.5) * 2
        vys[i] = -(Math.random() * 8 + 4)
      }
    }
    wasMuted = params.muted

    if (params.muted) {
      updateGravity(dt)
    } else if (params.patternMode === 'fixed') {
      updateFixed(audio, dt)
    } else {
      updateAdjustable(audio, dt)
    }
  },

  draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if ((w === 0 || h === 0) && width > 0 && height > 0) {
      w = width
      h = height
      initParticles(mapDensity(params.density))
    }

    ctx.fillStyle = params.backgroundColor
    ctx.fillRect(0, 0, width, height)

    const size = params.particleSize
    ctx.fillStyle = params.particleColor
    ctx.globalAlpha = 0.85

    for (let i = 0; i < particleCount; i++) {
      ctx.beginPath()
      ctx.arc(xs[i], ys[i], size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    if (params.patternMode === 'adjustable') {
      const focals = params.focalPoints
      for (let i = 0; i < focals.length; i++) {
        const fx = focals[i].x * width
        const fy = focals[i].y * height

        ctx.strokeStyle = 'rgba(128,128,128,0.5)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(fx, fy, 14, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = 'rgba(255,255,255,0.7)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(fx, fy, 13, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = 'rgba(128,128,128,0.6)'
        ctx.beginPath()
        ctx.arc(fx, fy, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },

  dispose() {
    particleCount = 0
  },
}
