import { BuildEntity, EntityType } from './entity-types.js'
import { newBattery } from './entity/battery.js'
import { newDisplay } from './entity/display.js'
import { newGenerator } from './entity/generator.js'
import { newSolarPanel } from './entity/solar-panel.js'
import { newMiner } from './miner.js'
import { Vec2 } from './vec2.js'

export interface EntityConfig {
  init(args: Omit<BuildEntity, 'type' | 'color'>): BuildEntity
  size: Vec2
}

export const ENTITY_CONFIG: Partial<Record<EntityType, EntityConfig>> = {
  [EntityType.Miner]: {
    init: (args) => newMiner({ ...args, color: 'blue', target: null }),
    size: new Vec2(2, 2),
  },
  [EntityType.Generator]: {
    init: (args) => newGenerator({ ...args, color: 'orange' }),
    size: new Vec2(3, 2),
  },
  [EntityType.SolarPanel]: {
    init: (args) => newSolarPanel({ ...args, color: 'cyan' }),
    size: new Vec2(3, 3),
  },
  [EntityType.Battery]: {
    init: (args) => newBattery({ ...args, color: 'purple' }),
    size: new Vec2(1, 1),
  },
  [EntityType.Display]: {
    init: (args) => newDisplay({ ...args, color: 'white' }),
    size: new Vec2(1, 1),
  },
}
