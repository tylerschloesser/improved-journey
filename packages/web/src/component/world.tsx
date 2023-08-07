import React, { useEffect, useState } from 'react'
import styles from './world.module.scss'

import { Outlet, useNavigate } from 'react-router-dom'
import { TICK_RATE } from '../const.js'
import { navigate$, viewport$, world$ } from '../game-state.js'
import { init } from '../init.js'
import { World as PixiWorld } from '../pixi/world.js'
import { Vec2 } from '../vec2.js'
import { worker } from '../worker.js'

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

    const abortController = new AbortController()

    init({
      canvas,
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

function useTickWorld() {
  useEffect(() => {
    const tickWorld = () => {
      worker.postMessage({
        world: world$.value,
      })
    }
    const interval = window.setInterval(tickWorld, 1000 / TICK_RATE)
    return () => {
      window.clearInterval(interval)
    }
  }, [])
}

export function World() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useResizeObserver(canvas)
  useInitCanvas(canvas)
  useNavigateListener()
  useTickWorld()

  return (
    <div className={styles.container}>
      {canvas && <PixiWorld canvas={canvas} />}
      <canvas className={styles.canvas} ref={setCanvas}></canvas>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  )
}
