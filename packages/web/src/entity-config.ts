import { Entity, EntityType } from './entity-types.js'
import { newGenerator } from './entity/generator.js'
import { newMiner } from './miner.js'
import { Vec2 } from './vec2.js'

export interface EntityConfig {
  init(
    args: Omit<Entity, 'id' | 'type' | 'nodes' | 'color'>,
  ): Omit<Entity, 'id'>
  size: Vec2
}

export const ENTITY_CONFIG: Partial<Record<EntityType, EntityConfig>> = {
  [EntityType.Miner]: {
    init: (args) => newMiner({ ...args, color: 'blue' }),
    size: new Vec2(2, 2),
  },
  [EntityType.Generator]: {
    init: (args) => newGenerator({ ...args, color: 'orange' }),
    size: new Vec2(3, 2),
  },
}
