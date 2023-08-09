import { newDisplay } from './entity/display.js'
import { newGenerator } from './entity/generator.js'
import { addEntities } from './game-state.js'
import { newMiner } from './miner.js'
import { World } from './types.js'
import { Vec2 } from './vec2.js'

export function generateWorld(): World {
  console.log('generating world...')
  const world: World = {
    tick: 0,
    nextEntityId: 0,
    entities: {},
    chunks: {},
    connections: {},
  }

  addEntities(world, [
    newMiner({
      position: new Vec2(1, 2),
      size: new Vec2(2, 2),
      target: null,
    }),

    newGenerator({
      position: new Vec2(6, 2),
      size: new Vec2(3, 2),
    }),

    newDisplay({
      position: new Vec2(3, -1),
      size: new Vec2(1, 1),
    }),
  ])

  return world
}
