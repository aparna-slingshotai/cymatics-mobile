import type { AudioData } from './modes/types'

const SMOOTHING = 0.8
const BEAT_THRESHOLD = 1.4
const BEAT_COOLDOWN_FRAMES = 8
const ROLLING_WINDOW = 30

let rollingVolumes: number[] = []
let beatCooldown = 0

let prevBass = 0
let prevLowMid = 0
let prevMid = 0
let prevHighMid = 0
let prevTreble = 0
let prevVolume = 0

function avgRange(data: Uint8Array, start: number, end: number): number {
  let sum = 0
  for (let i = start; i <= end && i < data.length; i++) {
    sum += data[i]
  }
  return sum / (end - start + 1) / 255
}

function rms(timeDomain: Uint8Array): number {
  let sum = 0
  for (let i = 0; i < timeDomain.length; i++) {
    const v = (timeDomain[i] - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / timeDomain.length)
}

function smooth(prev: number, current: number): number {
  return prev * SMOOTHING + current * (1 - SMOOTHING)
}

export function analyzeAudio(
  frequencyBins: Uint8Array,
  timeDomain: Uint8Array
): AudioData {
  const rawBass = avgRange(frequencyBins, 0, 5)
  const rawLowMid = avgRange(frequencyBins, 6, 15)
  const rawMid = avgRange(frequencyBins, 16, 40)
  const rawHighMid = avgRange(frequencyBins, 41, 80)
  const rawTreble = avgRange(frequencyBins, 81, 127)
  const rawVolume = rms(timeDomain)

  prevBass = smooth(prevBass, rawBass)
  prevLowMid = smooth(prevLowMid, rawLowMid)
  prevMid = smooth(prevMid, rawMid)
  prevHighMid = smooth(prevHighMid, rawHighMid)
  prevTreble = smooth(prevTreble, rawTreble)
  prevVolume = smooth(prevVolume, rawVolume)

  rollingVolumes.push(rawVolume)
  if (rollingVolumes.length > ROLLING_WINDOW) rollingVolumes.shift()

  let isBeat = false
  if (beatCooldown > 0) {
    beatCooldown--
  } else {
    const rollingAvg =
      rollingVolumes.reduce((a, b) => a + b, 0) / rollingVolumes.length
    if (rawVolume > rollingAvg * BEAT_THRESHOLD && rawVolume > 0.05) {
      isBeat = true
      beatCooldown = BEAT_COOLDOWN_FRAMES
    }
  }

  return {
    bass: prevBass,
    lowMid: prevLowMid,
    mid: prevMid,
    highMid: prevHighMid,
    treble: prevTreble,
    volume: prevVolume,
    isBeat,
    frequencyBins,
    timeDomain,
  }
}

export function resetAnalysis() {
  rollingVolumes = []
  beatCooldown = 0
  prevBass = 0
  prevLowMid = 0
  prevMid = 0
  prevHighMid = 0
  prevTreble = 0
  prevVolume = 0
}
