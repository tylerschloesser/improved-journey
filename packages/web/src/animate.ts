import invariant from 'tiny-invariant'
import { Vec2 } from './vec2.js'

export interface AnimateVec2Args {
  from: Vec2
  to: Vec2
  duration: number
  callback(v: Vec2): void
}

// https://css-tricks.com/emulating-css-timing-functions-javascript/
function easeIn(k: number) {
  invariant(k >= 0 && k <= 1)
  return 1 - Math.pow(1 - k, 1.675)
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

    const k = elapsed / duration

    callback(from.add(d.mul(easeIn(k))))

    window.requestAnimationFrame(onFrame)
  }
  window.requestAnimationFrame(onFrame)
}
