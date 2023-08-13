import { World } from '../types.js'

export function fastForwardWorld(world: World): {
  world: World
  ticks: number
} {
  return {
    world,
    ticks: 0,
  }
}
