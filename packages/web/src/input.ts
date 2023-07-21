import { Vec2, gameState } from './game-state.js'

function toVec2(ev: PointerEvent): Vec2 {
  return new Vec2(ev.clientX, ev.clientY)
}

function handleMove({
  prev,
  next,
}: {
  prev: PointerEvent
  next: PointerEvent
}) {
  const d = toVec2(next).sub(toVec2(prev))
  gameState.position = gameState.position.add(d)
}

export function initInput({
  canvas,
  signal,
}: {
  canvas: HTMLCanvasElement
  signal: AbortSignal
}) {
  const pointerCache = new Map<number, PointerEvent>()

  canvas.addEventListener(
    'pointermove',
    (ev) => {
      const prev = pointerCache.get(ev.pointerId)
      pointerCache.set(ev.pointerId, ev)

      if (prev && prev.pressure > 0 && ev.pressure > 0) {
        handleMove({ prev, next: ev })
      }
    },
    { signal },
  )
}
