import React, { useEffect, useState } from 'react'
import { initInput } from '../input.js'
import styles from './home.module.scss'

import { Application } from 'pixi.js'
import { Vec2, viewport$ } from '../game-state.js'
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
      resizeTo: canvas,
      view: canvas,
      width: rect.width,
      height: rect.height,
    })

    const abortController = new AbortController()

    initInput({ canvas, signal: abortController.signal })
    initGrid({ app })

    viewport$.subscribe((v) => {
      console.log(v)
    })

    const resizeObserver = new ResizeObserver(([entry]) => {
      viewport$.next(
        new Vec2(entry.contentRect.width, entry.contentRect.height),
      )
    })
    resizeObserver.observe(canvas)

    return () => {
      abortController.abort()
      resizeObserver.disconnect()
    }
  }, [canvas])

  return { setCanvas }
}

export function Home() {
  const { setCanvas } = useCanvas()
  return <canvas className={styles.canvas} ref={setCanvas}></canvas>
}
