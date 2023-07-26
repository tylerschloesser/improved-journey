import React, { useEffect, useState } from 'react'
import { initInput } from '../input.js'
import styles from './home.module.scss'

import { Application } from 'pixi.js'
import { initGrid } from '../init-grid.js'

type SetCanvasFn = React.Dispatch<
  React.SetStateAction<HTMLCanvasElement | null>
>

function useCanvas(): { setCanvas: SetCanvasFn } {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const app = new Application({
      view: canvas,
      width: rect.width,
      height: rect.height,
    })

    const abortController = new AbortController()

    initInput({ canvas, signal: abortController.signal })
    initGrid({ app, rect })

    return () => {
      abortController.abort()
    }
  }, [canvas])

  return { setCanvas }
}

export function Home() {
  const { setCanvas } = useCanvas()
  return <canvas className={styles.canvas} ref={setCanvas}></canvas>
}
