import React, { Suspense, useEffect, useState } from 'react'
import styles from './world.module.scss'

import { Container, Stage } from '@pixi/react'
import { bind, Subscribe } from '@react-rxjs/core'
import { Outlet, useNavigate } from 'react-router-dom'
import { TICK_RATE } from '../const.js'
import { cellSize$, navigate$, position$, viewport$ } from '../game-state.js'
import { init } from '../init.js'
import { tickWorld } from '../tick.js'
import { Vec2 } from '../vec2.js'
import { Grid } from './grid.js'
import { Entities } from './entities.js'
import { Build } from '../pixi/build.js'

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

    // const app = new Application({
    //   resizeTo: canvas,
    //   view: canvas,
    // })

    // app.stage.sortableChildren = true

    const abortController = new AbortController()

    init({
      canvas,
      // app,
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
    const interval = window.setInterval(tickWorld, 1000 / TICK_RATE)
    return () => {
      window.clearInterval(interval)
    }
  }, [])
}

const [usePosition] = bind(position$)
const [useCellSize] = bind(cellSize$)
const [useViewport] = bind(viewport$)

function useTransform() {
  const position = usePosition()
  const cellSize = useCellSize()
  const viewport = useViewport()
  return {
    translate: position.mul(cellSize * -1).add(viewport.div(2)),
    scale: cellSize,
  }
}

function Transform({ children }: React.PropsWithChildren) {
  const transform = useTransform()
  return (
    <Container
      x={transform.translate.x}
      y={transform.translate.y}
      scale={transform.scale}
    >
      {children}
    </Container>
  )
}

export function World() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useResizeObserver(canvas)
  useInitCanvas(canvas)
  useNavigateListener()
  useTickWorld()

  return (
    <div className={styles.container}>
      {canvas && (
        <Stage
          options={{
            resizeTo: window,
            view: canvas,
          }}
          onMount={(app) => {
            // hack because @pixi/react doesn't
            // respect my initial size...
            window.setTimeout(() => {
              app.resize()
            }, 0)
          }}
        >
          {/* TODO I need this subscribe here even though I already
        have on in index. Not sure why.. something to do with @pixi/react */}
          <Subscribe>
            <Suspense>
              <Grid />
              <Transform>
                <Entities />
                <Build />
              </Transform>
            </Suspense>
          </Subscribe>
        </Stage>
      )}
      <canvas className={styles.canvas} ref={setCanvas}></canvas>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  )
}
