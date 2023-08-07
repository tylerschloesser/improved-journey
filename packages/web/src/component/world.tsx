import React, { Suspense, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { interval, withLatestFrom } from 'rxjs'
import { TICK_RATE } from '../const.js'
import { navigate$, viewport$, world$ } from '../game-state.js'
import { init } from '../init.js'
import { World as PixiWorld } from '../pixi/world.js'
import { loadWorld } from '../storage.js'
import { Vec2 } from '../vec2.js'
import { worker } from '../worker.js'
import styles from './world.module.scss'

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
    const sub = interval(1000 / TICK_RATE)
      .pipe(withLatestFrom(world$))
      .subscribe(([_, world]) => {
        worker.postMessage({ world })
      })

    return () => {
      sub.unsubscribe()
    }
  }, [])
}

function useInitWorld() {
  useEffect(() => {
    loadWorld().then((world) => {
      world$.next(world)
    })
  }, [])
}

export function World() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useResizeObserver(canvas)
  useInitCanvas(canvas)
  useNavigateListener()
  useTickWorld()
  useInitWorld()

  return (
    <div className={styles.container}>
      {canvas && <PixiWorld canvas={canvas} />}
      <canvas className={styles.canvas} ref={setCanvas}></canvas>
      <div className={styles.outlet}>
        <Suspense>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
