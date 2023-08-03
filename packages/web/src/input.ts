import { curry } from 'lodash-es'
import invariant from 'tiny-invariant'
import { dampen$, move$, pinch$, tap$, wheel$ } from './game-state.js'
import { Vec2 } from './vec2.js'

function toVec2(ev: PointerEvent): Vec2 {
  return new Vec2(ev.clientX, ev.clientY)
}

type PointerId = number

interface PointerState {
  pointerEventCache: Map<PointerId, PointerEvent[]>
}

function handlePointerMoveTwo(state: PointerState, ev: PointerEvent): void {
  invariant(state.pointerEventCache.size === 2)

  let prev: PointerEvent
  let other: PointerEvent
  for (const [pointerId, events] of state.pointerEventCache.entries()) {
    invariant(events.length > 0)
    if (pointerId === ev.pointerId) {
      prev = events.at(-1)!
      // add the next event to the cache
      events.push(ev)
    } else {
      other = events.at(-1)!
    }
  }

  invariant(prev!)
  invariant(other!)

  const prevDist = toVec2(prev).sub(toVec2(other)).len()
  const dist = toVec2(ev).sub(toVec2(other)).len()

  const delta = dist - prevDist

  pinch$.next({ delta })
}

const onPointerMove = curry((state: PointerState, ev: PointerEvent) => {
  let cache = state.pointerEventCache.get(ev.pointerId)
  if (!cache) {
    cache = []
    state.pointerEventCache.set(ev.pointerId, cache)
  }

  if (state.pointerEventCache.size === 2) {
    handlePointerMoveTwo(state, ev)
    return
  } else if (state.pointerEventCache.size > 2) {
    // Currently don't support more than 2 pointers
    return
  }

  const prev = cache.at(-1)
  cache.push(ev)

  if (prev && prev.pressure > 0 && ev.pressure > 0) {
    const dp = toVec2(ev).sub(toVec2(prev))
    move$.next(dp)
  }
})

function isTap(cache: PointerEvent[], ev: PointerEvent) {
  invariant(cache.length > 0)
  const first = cache.at(0)

  invariant(first?.type === 'pointerdown')
  if (cache.length === 1) {
    return true
  }

  const dt = ev.timeStamp - first.timeStamp

  // const dp = toVec2(up).sub(toVec2(down))
  // const dist = dp.len()

  return dt < 100
}

const onPointerDown = curry((state: PointerState, ev: PointerEvent) => {
  state.pointerEventCache.set(ev.pointerId, [ev])
})

const onPointerLeave = curry((state: PointerState, ev: PointerEvent) => {
  state.pointerEventCache.delete(ev.pointerId)
})

const onPointerUp = curry((state: PointerState, ev: PointerEvent) => {
  if (state.pointerEventCache.size > 1) {
    state.pointerEventCache.delete(ev.pointerId)
    return
  }

  const now = ev.timeStamp
  const cache = state.pointerEventCache.get(ev.pointerId) ?? []

  if (isTap(cache, ev)) {
    tap$.next(toVec2(ev))
    return
  }

  const last = cache.at(-1)
  invariant(last)

  // only dampen if last pointermove was <= 100ms ago
  if (now - last.timeStamp > 100) return

  state.pointerEventCache.delete(ev.pointerId)

  const latest = cache.filter((cached) => {
    return now - cached.timeStamp < 500
  })

  if (latest.length < 2) return

  const velocities: Vec2[] = []

  for (let i = 1; i < latest.length; i++) {
    const a = latest[i - 1]
    const b = latest[i]
    const dt = b.timeStamp - a.timeStamp
    const dp = toVec2(b).sub(toVec2(a))
    if (dt === 0) {
      // TODO not sure how this happens. dp.len is not zero...
      velocities.push(new Vec2(0))
    } else {
      velocities.push(dp.div(dt))
    }
  }

  let vavg = velocities
    .reduce((acc, v) => acc.add(v), new Vec2(0, 0))
    .div(velocities.length)

  const exitVelocity = velocities.at(-1)
  invariant(exitVelocity)

  // final velocity that we will use for decceleration is the
  // direction of the most recent 2 pointer events, and the average
  // speed of pointer over the last several hundred ms
  let v = exitVelocity.norm().mul(vavg.len())

  dampen$.next({ v })
})

function onWheel(ev: WheelEvent) {
  ev.preventDefault()
  wheel$.next({
    deltaY: ev.deltaY,
    position: new Vec2(ev.clientX, ev.clientY),
  })
}

export function initInput({
  canvas,
  signal,
}: {
  canvas: HTMLCanvasElement
  signal: AbortSignal
}) {
  const state: PointerState = {
    pointerEventCache: new Map(),
  }

  canvas.addEventListener('pointermove', onPointerMove(state), { signal })
  canvas.addEventListener('pointerup', onPointerUp(state), { signal })
  canvas.addEventListener('pointerdown', onPointerDown(state), { signal })
  canvas.addEventListener('pointerleave', onPointerLeave(state), { signal })
  canvas.addEventListener('wheel', onWheel, { signal, passive: false })
}
