export interface AudioData {
  bass: number
  lowMid: number
  mid: number
  highMid: number
  treble: number
  volume: number
  isBeat: boolean
  frequencyBins: Uint8Array
  timeDomain: Uint8Array
}

export interface VisualizerMode {
  init(width: number, height: number): void
  update(audio: AudioData, dt: number): void
  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void
  dispose(): void
}

export interface FocalPoint {
  x: number
  y: number
}

export type PatternMode = 'fixed' | 'adjustable'

export interface CymaticsParams {
  density: number
  frequency: number
  particleSize: number
  backgroundColor: string
  particleColor: string
  inputSensitivity: number
  focalPoints: FocalPoint[]
  patternMode: PatternMode
}

export interface ParameterizedMode extends VisualizerMode {
  setParams(params: CymaticsParams): void
}

export const DEFAULT_FOCAL_POINTS: FocalPoint[] = [
  { x: 0.35, y: 0.3 },
  { x: 0.65, y: 0.3 },
  { x: 0.35, y: 0.7 },
  { x: 0.65, y: 0.7 },
]

export const DEFAULT_PARAMS: CymaticsParams = {
  density: 100,
  frequency: 7,
  particleSize: 1,
  backgroundColor: '#F5F0EA',
  particleColor: '#5C4633',
  inputSensitivity: 0.7,
  focalPoints: DEFAULT_FOCAL_POINTS,
  patternMode: 'fixed',
}
