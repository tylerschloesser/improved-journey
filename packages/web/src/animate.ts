import { Vec2 } from './vec2.js'

export interface AnimateVec2Args {
  from: Vec2
  to: Vec2
  duration: number
  callback(v: Vec2): void
}

export function animateVec2({
  from,
  to,
  duration,
  callback,
}: AnimateVec2Args): void {
  const d = to.sub(from)
  const start = window.performance.now()

  function onFrame() {
    const now = window.performance.now()
    if (now - start >= duration) {
      callback(to)
      return
    }

    const elapsed = now - start

    callback(from.add(d.mul(elapsed / duration)))

    window.requestAnimationFrame(onFrame)
  }
  window.requestAnimationFrame(onFrame)
}
