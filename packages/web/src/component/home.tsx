import React, { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'
import { initInput } from '../input.js'
import { render } from '../render.js'
import styles from './home.module.scss'

import { Application, Graphics } from 'pixi.js'
import { gameState } from '../game-state.js'

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
    // const context = canvas.getContext('2d')
    // invariant(context)

    initInput({ canvas, signal: abortController.signal })

    let obj = new Graphics()
    obj.beginFill(0xff0000)
    obj.drawRect(0, 0, 100, 100)

    obj.lineStyle(2, 'white')

    const cellSize = 40

    const rows = Math.ceil(rect.height / cellSize)
    const cols = Math.ceil(rect.width / cellSize)

    for (let x = 0; x < cols; x++) {
      obj.moveTo(x * cellSize, 0).lineTo(x * cellSize, rect.height)
    }

    for (let y = 0; y < rows; y++) {
      obj.moveTo(0, y * cellSize).lineTo(rect.width, y * cellSize)
    }

    // Add it to the stage to render
    app.stage.addChild(obj)

    app.ticker.add(() => {
      obj.position.set(gameState.position.x, gameState.position.y)
    })

    // function onFrame() {
    //   if (abortController.signal.aborted) {
    //     console.log('stopping request animation frame loop')
    //     return
    //   }

    //   invariant(canvas)
    //   invariant(context)
    //   render({ canvas, context })

    //   requestAnimationFrame(onFrame)
    // }
    // requestAnimationFrame(onFrame)

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
