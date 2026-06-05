import { useReducer, useCallback } from 'react'
import { DEFAULT_PARAMS, type CymaticsParams } from '../modes/types'

type Action =
  | { type: 'set'; key: keyof CymaticsParams; value: CymaticsParams[keyof CymaticsParams] }
  | { type: 'reset' }
  | { type: 'setPreset'; params: Partial<CymaticsParams> }
  | { type: 'moveFocal'; index: number; x: number; y: number }

function reducer(state: CymaticsParams, action: Action): CymaticsParams {
  switch (action.type) {
    case 'set':
      return { ...state, [action.key]: action.value }
    case 'reset':
      return { ...DEFAULT_PARAMS }
    case 'setPreset':
      return { ...state, ...action.params }
    case 'moveFocal': {
      const focalPoints = state.focalPoints.map((fp, i) =>
        i === action.index ? { x: action.x, y: action.y } : fp
      )
      return { ...state, focalPoints }
    }
    default:
      return state
  }
}

export function useParameters() {
  const [params, dispatch] = useReducer(reducer, DEFAULT_PARAMS)

  const setParam = useCallback(<K extends keyof CymaticsParams>(key: K, value: CymaticsParams[K]) => {
    dispatch({ type: 'set', key, value })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  const setPreset = useCallback((preset: Partial<CymaticsParams>) => {
    dispatch({ type: 'setPreset', params: preset })
  }, [])

  const moveFocalPoint = useCallback((index: number, x: number, y: number) => {
    dispatch({ type: 'moveFocal', index, x, y })
  }, [])

  return { params, setParam, reset, setPreset, moveFocalPoint }
}
