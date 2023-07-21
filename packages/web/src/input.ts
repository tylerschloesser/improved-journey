import { Vec2, gameState } from './game-state.js'

function toVec2(ev: PointerEvent): Vec2 {
  return new Vec2(ev.clientX, ev.clientY)
}

type PointerId = number

export function initInput({
  canvas,
  signal,
}: {
  canvas: HTMLCanvasElement
  signal: AbortSignal
}) {
  const pointerCache = new Map<PointerId, PointerEvent>()

  let lastPositionChange: {
    v: Vec2
    time: number
  } | null = null

  canvas.addEventListener(
    'pointermove',
    (ev) => {
      const prev = pointerCache.get(ev.pointerId)
      pointerCache.set(ev.pointerId, ev)

      if (prev && prev.pressure > 0 && ev.pressure > 0) {
        const dp = toVec2(ev).sub(toVec2(prev)).mul(-1)
        gameState.position = gameState.position.add(dp)

        const dt = ev.timeStamp - prev.timeStamp

        // pointer velocity, in pixels/ms
        const v = dp.div(dt)

        lastPositionChange = {
          v,
          time: ev.timeStamp,
        }
      }
    },
    { signal },
  )

  canvas.addEventListener(
    'pointerup',
    (ev) => {
      if (lastPositionChange === null) return

      const dt = ev.timeStamp - lastPositionChange.time

      if (dt > 100) return

      console.log('todo dampen')
    },
    { signal },
  )
}
