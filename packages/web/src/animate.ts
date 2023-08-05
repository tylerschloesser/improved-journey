import invariant from 'tiny-invariant'
import { Vec2 } from './vec2.js'

export interface AnimateVec2Args {
  from: Vec2
  to: Vec2
  duration: number
  callback(v: Vec2, elapsed: number): void
  timingFn?: TimingFn
}

export type TimingFn = (x: number) => number

// https://css-tricks.com/emulating-css-timing-functions-javascript/
export const easeIn: TimingFn = (k: number) => {
  invariant(k >= 0 && k <= 1)
  return 1 - Math.pow(1 - k, 1.675)
}

// https://easings.net/#easeOutCirc
export const easeOutCirc: TimingFn = (x: number) => {
  return Math.sqrt(1 - Math.pow(x - 1, 2))
}

export function animateVec2({
  from,
  to,
  duration,
  callback,
  timingFn = easeOutCirc,
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

    callback(from.add(d.mul(timingFn(k))), now - last)

    last = now

    window.requestAnimationFrame(onFrame)
  }
  window.requestAnimationFrame(onFrame)
}
