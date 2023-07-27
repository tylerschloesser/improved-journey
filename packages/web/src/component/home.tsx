import React, { useEffect, useState } from 'react'
import styles from './home.module.scss'

import { Application } from 'pixi.js'
import { Vec2, viewport$ } from '../game-state.js'
import { init } from '../init.js'

function useResizeObserver(canvas: HTMLCanvasElement | null) {
  useEffect(() => {
    if (!canvas) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      viewport$.next(
        new Vec2(entry.contentRect.width, entry.contentRect.height),
      )
    })
    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [canvas])
}

function useInitCanvas(canvas: HTMLCanvasElement | null) {
  useEffect(() => {
    if (!canvas) return

    const app = new Application({
      resizeTo: canvas,
      view: canvas,
    })

    const abortController = new AbortController()

    init({
      canvas,
      app,
      signal: abortController.signal,
    })

    return () => {
      abortController.abort()
    }
  }, [canvas])
}

export function Home() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useResizeObserver(canvas)
  useInitCanvas(canvas)
  return <canvas className={styles.canvas} ref={setCanvas}></canvas>
}
