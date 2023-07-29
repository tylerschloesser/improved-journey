import React, { useEffect, useState } from 'react'
import styles from './world.module.scss'

import { Application } from 'pixi.js'
import { navigate$, viewport$ } from '../game-state.js'
import { init } from '../init.js'
import { Outlet, useNavigate } from 'react-router-dom'
import { Vec2 } from '../vec2.js'

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

    app.stage.sortableChildren = true

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

function useNavigateListener() {
  const navigate = useNavigate()
  useEffect(() => {
    const sub = navigate$.subscribe(({ to }) => {
      navigate(to)
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])
}

export function World() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useResizeObserver(canvas)
  useInitCanvas(canvas)
  useNavigateListener()
  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={setCanvas}></canvas>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  )
}
