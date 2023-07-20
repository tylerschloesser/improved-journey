import React, { useEffect, useState } from 'react'
import styles from './home.module.scss'
import invariant from 'tiny-invariant'
import { render } from '../render.js'

type SetCanvasFn = React.Dispatch<
  React.SetStateAction<HTMLCanvasElement | null>
>

function useCanvas(): { setCanvas: SetCanvasFn } {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const abortController = new AbortController()
    const context = canvas.getContext('2d')
    invariant(context)

    function onFrame() {
      if (abortController.signal.aborted) {
        console.log('stopping request animation frame loop')
        return
      }

      invariant(canvas)
      invariant(context)
      render({ canvas, context })

      requestAnimationFrame(onFrame)
    }
    requestAnimationFrame(onFrame)

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
