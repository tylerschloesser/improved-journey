import invariant from 'tiny-invariant'
import { TICK_RATE } from '../const.js'
import { World } from '../types.js'
import { tickWorld } from './tick.js'

export function fastForwardWorld(world: World): {
  world: World
  ticks: number
} {
  let ticks = 0
  while (true) {
    const ticksExpected = Math.floor(
      ((Date.now() - world.start) / 1000) * TICK_RATE,
    )
    let ticksBehind = ticksExpected - world.tick

    invariant(ticksBehind >= 0)
    if (ticksBehind === 0) break

    console.log('ticks behind:', ticksBehind)

    ticks += ticksBehind

    while (ticksBehind-- > 0) {
      tickWorld(world)
    }
  }

  return {
    world,
    ticks,
  }
}
