import { Vec2, gameState } from './game-state.js'

function handleMove({
  prev,
  next,
}: {
  prev: PointerEvent
  next: PointerEvent
}) {
  const d = new Vec2(next.clientX, next.clientY).sub(
    new Vec2(prev.clientX, prev.clientY),
  )

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
