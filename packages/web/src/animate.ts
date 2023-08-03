import invariant from 'tiny-invariant'
import { Vec2 } from './vec2.js'

export interface AnimateVec2Args {
  from: Vec2
  to: Vec2
  duration: number
  callback(v: Vec2, elapsed: number): void
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
  let last = start

  function onFrame() {
    const now = window.performance.now()
    const elapsed = now - start
    if (elapsed >= duration) {
      callback(to, now - last)
      return
    }

    const k = elapsed / duration

    callback(from.add(d.mul(easeIn(k))), now - last)

    last = now

    window.requestAnimationFrame(onFrame)
  }
  window.requestAnimationFrame(onFrame)
}
