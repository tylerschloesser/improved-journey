import { addEntities } from './add-entities.js'
import { WORLD_VERSION } from './const.js'
import { newDisplay } from './entity/display.js'
import { newGenerator } from './entity/generator.js'
import { newMiner } from './miner.js'
import { World } from './types.js'
import { Vec2 } from './vec2.js'

export function generateWorld(): World {
  console.log('generating world...')
  const world: World = {
    version: WORLD_VERSION,
    tick: 0,
    nextEntityId: 0,
    entities: {},
    chunks: {},
  }

  addEntities(world, [
    newMiner({
      position: new Vec2(1, 2),
      size: new Vec2(2, 2),
      target: null,
      connections: {
        input: new Set(),
        output: new Set(),
      },
    }),

    newGenerator({
      position: new Vec2(6, 2),
      size: new Vec2(3, 2),
      connections: {
        input: new Set(),
        output: new Set(),
      },
    }),

    newDisplay({
      position: new Vec2(3, -1),
      size: new Vec2(1, 1),
      connections: {
        input: new Set(),
        output: new Set(),
      },
    }),
  ])

  return world
}
