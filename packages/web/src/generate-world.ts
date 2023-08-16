import { addEntities } from './add-entities.js'
import { WORLD_VERSION } from './const.js'
import { ENTITY_CONFIG } from './entity-config.js'
import {
  BuildEntity,
  DisplayContentType,
  EntityStateType,
} from './entity-types.js'
import { ItemType } from './item-types.js'
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
    robots: {},
  }

  const builds: BuildEntity[] = [
    ENTITY_CONFIG.miner.init({
      state: { type: EntityStateType.Active },
      position: new Vec2(1, 2).toSimple(),
      target: ItemType.Coal,
    }),

    ENTITY_CONFIG.generator.init({
      state: { type: EntityStateType.Active },
      position: new Vec2(6, 2).toSimple(),
      fuel: {
        type: ItemType.Coal,
        count: 1,
      },
    }),

    ENTITY_CONFIG.display.init({
      state: { type: EntityStateType.Active },
      position: new Vec2(3, -1).toSimple(),
      content: {
        type: DisplayContentType.Satisfaction,
      },
    }),

    ENTITY_CONFIG['robot-station'].init({
      state: { type: EntityStateType.Active },
      position: new Vec2(1, 6).toSimple(),
    }),
  ]

  for (let x = 3; x <= 5; x++) {
    builds.push(
      ENTITY_CONFIG.belt.init({
        state: { type: EntityStateType.Active },
        position: new Vec2(x, 2).toSimple(),
        direction: 'right',
      }),
    )
  }

  addEntities(world, builds)

  return world
}
