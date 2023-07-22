import React, { useEffect, useState } from 'react'
import { initInput } from '../input.js'
import styles from './home.module.scss'

import { Application, Graphics, ICanvas } from 'pixi.js'
import { gameState } from '../game-state.js'

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

type SetCanvasFn = React.Dispatch<
  React.SetStateAction<HTMLCanvasElement | null>
>

function initCellGrid({
  app,
  rect,
}: {
  app: Application<ICanvas>
  rect: DOMRect
}) {
  let obj = new Graphics()

  obj.lineStyle(2, 'hsl(0, 0%, 10%)')

  const cellSize = 40

  const rows = Math.ceil(rect.height / cellSize) + 1
  const cols = Math.ceil(rect.width / cellSize) + 1

  for (let x = 0; x < cols; x++) {
    obj.moveTo(x * cellSize, 0).lineTo(x * cellSize, cellSize * rows)
  }

  for (let y = 0; y < rows; y++) {
    obj.moveTo(0, y * cellSize).lineTo(cellSize * cols, y * cellSize)
  }

  app.stage.addChild(obj)

  gameState.position$.subscribe((position) => {
    obj.position.set(
      mod(position.x, cellSize) - cellSize,
      mod(position.y, cellSize) - cellSize,
    )
  })
}

function initChunkGrid({
  app,
  rect,
}: {
  app: Application<ICanvas>
  rect: DOMRect
}) {
  let obj = new Graphics()

  obj.lineStyle(2, 'hsl(0, 0%, 30%)')
  const cellSize = 40
  const chunkSize = 10

  const rows = Math.ceil(rect.height / cellSize / chunkSize) + 1
  const cols = Math.ceil(rect.width / cellSize / chunkSize) + 1

  for (let x = 0; x < cols; x++) {
    obj
      .moveTo(x * cellSize * chunkSize, 0)
      .lineTo(x * cellSize * chunkSize, cellSize * chunkSize * rows)
  }

  for (let y = 0; y < rows; y++) {
    obj
      .moveTo(0, y * cellSize * chunkSize)
      .lineTo(cellSize * chunkSize * cols, y * cellSize * chunkSize)
  }

  app.stage.addChild(obj)

  gameState.position$.subscribe((position) => {
    obj.position.set(
      mod(position.x, cellSize * chunkSize) - cellSize * chunkSize,
      mod(position.y, cellSize * chunkSize) - cellSize * chunkSize,
    )
  })
}

function initGrid({ app, rect }: { app: Application<ICanvas>; rect: DOMRect }) {
  initCellGrid({ app, rect })
  initChunkGrid({ app, rect })
}

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
    // const context = canvas.getContext('2d')
    // invariant(context)

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
