import { curry } from 'lodash-es'
import { Vec2, gameState } from './game-state.js'

function toVec2(ev: PointerEvent): Vec2 {
  return new Vec2(ev.clientX, ev.clientY)
}

type PointerId = number

interface PointerState {
  pointerMoveCache: Map<PointerId, PointerEvent[]>
}

const onPointerMove = curry((state: PointerState, ev: PointerEvent) => {
  let cache = state.pointerMoveCache.get(ev.pointerId)
  if (!cache) {
    cache = []
    state.pointerMoveCache.set(ev.pointerId, cache)
  }

  const prev = cache.at(-1)
  cache.push(ev)

  if (prev && prev.pressure > 0 && ev.pressure > 0) {
    const dp = toVec2(ev).sub(toVec2(prev)).mul(-1)
    gameState.position = gameState.position.add(dp)
  }
})

const onPointerUp = curry((state: PointerState, ev: PointerEvent) => {
  const now = ev.timeStamp

  const cache = state.pointerMoveCache.get(ev.pointerId) ?? []
  const last = cache.at(-1)

  if (!last) return

  // only dampen if last pointermove was <= 100ms ago
  if (now - last.timeStamp > 100) return

  state.pointerMoveCache.delete(ev.pointerId)

  const latest = cache.filter((cached) => {
    return now - cached.timeStamp < 500
  })

  if (latest.length < 2) return

  let vavg = new Vec2(0, 0)
  for (let i = 1; i < latest.length; i++) {
    const a = latest[i - 1]
    const b = latest[i]
    const dt = b.timeStamp - a.timeStamp
    const dp = toVec2(b).sub(toVec2(a))
    vavg = vavg.add(dp.div(dt))
  }

  vavg = vavg.div(latest.length - 1).mul(-1)

  let v = vavg
  let lastUpdate = last.timeStamp

  const acceleration = v.mul(-1).div(100)

  function dampen() {
    const now = window.performance.now()
    const dt = now - lastUpdate
    lastUpdate = now

    // basically check the most significant digit of the
    // angle to see if we changed direction
    const startAngle = Math.trunc(v.angle())

    v = v.add(acceleration.mul(dt))

    const endAngle = Math.trunc(v.angle())

    if (startAngle !== endAngle) return

    gameState.position = gameState.position.add(v.mul(dt))

    window.requestAnimationFrame(dampen)
  }
  dampen()
})

export function initInput({
  canvas,
  signal,
}: {
  canvas: HTMLCanvasElement
  signal: AbortSignal
}) {
  const state: PointerState = {
    pointerMoveCache: new Map(),
  }

  canvas.addEventListener(
    'pointermove',
    (ev) => {
      onPointerMove(state, ev)
    },
    { signal },
  )

  canvas.addEventListener(
    'pointerup',
    (ev) => {
      onPointerUp(state, ev)
    },
    { signal },
  )
}
