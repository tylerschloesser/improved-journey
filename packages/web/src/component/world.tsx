import { Suspense, useEffect, useState } from 'react'
import { Outlet, useNavigate, useNavigationType } from 'react-router-dom'
import { fromEvent, interval, withLatestFrom } from 'rxjs'
import { TICK_RATE } from '../const.js'
import {
  navigate$,
  navigationType$,
  position$,
  satisfaction$,
  viewport$,
  world$,
  zoom$,
} from '../game-state.js'
import { init } from '../init.js'
import { World as PixiWorld } from '../pixi/world.js'
import { loadClient, loadWorld, saveWorld } from '../storage.js'
import { TickResponse } from '../types.js'
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
  }, [navigate])

  const navigationType = useNavigationType()
  useEffect(() => {
    navigationType$.next(navigationType)
  }, [navigationType])
}

function useTickWorld() {
  useEffect(() => {
    const subs = [
      interval(1000 / TICK_RATE)
        .pipe(withLatestFrom(world$))
        .subscribe(([_, world]) => {
          worker.postMessage({ world })
        }),

      fromEvent<MessageEvent<TickResponse>>(worker, 'message').subscribe(
        (message) => {
          const { world, stats } = message.data
          satisfaction$.next(stats.satisfaction)
          world$.next(world)
        },
      ),
    ]

    return () => {
      subs.forEach((sub) => sub.unsubscribe())
    }
  }, [])
}

function useInitWorld() {
  useEffect(() => {
    loadClient().then((client) => {
      position$.next(new Vec2(client.position))
      zoom$.next(client.zoom)
    })

    loadWorld().then((world) => {
      world$.next(world)
    })
  }, [])
}

function useAutoSaveWorld() {
  useEffect(() => {
    const sub = interval(10_000)
      .pipe(withLatestFrom(world$))
      .subscribe(([_, world]) => {
        saveWorld(world)
      })
    return () => {
      sub.unsubscribe()
      console.log('todo save on unmount')
    }
  }, [])
}

export function World() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useResizeObserver(canvas)
  useInitCanvas(canvas)
  useNavigateListener()
  useTickWorld()
  useInitWorld()
  useAutoSaveWorld()

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
