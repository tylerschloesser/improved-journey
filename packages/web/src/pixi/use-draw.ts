import { Graphics } from 'pixi.js'
import { useCallback } from 'react'

export const useDraw: typeof useCallback<(g: Graphics) => void> = useCallback
