import { addEntities } from './add-entities.js'
import { WORLD_VERSION } from './const.js'
import { ENTITY_CONFIG } from './entity-config.js'
import { World } from './types.js'
import { Vec2 } from './vec2.js'

export function generateWorld(): World {
  console.log('generating world...')
  const world: World = {
    start: Date.now(),
    version: WORLD_VERSION,
    tick: 0,
    nextEntityId: 0,
    entities: {},
    chunks: {},
    research: {},
  }

  addEntities(world, [
    ENTITY_CONFIG.miner.init({
      position: new Vec2(1, 2).toSimple(),
    }),

    ENTITY_CONFIG.generator.init({
      position: new Vec2(6, 2).toSimple(),
    }),

    ENTITY_CONFIG.display.init({
      position: new Vec2(3, -1).toSimple(),
    }),
  ])

  return world
}
