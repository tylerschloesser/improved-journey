import { newBelt } from './belt.js'
import { BuildEntity, EntityType } from './entity-types.js'
import { newBattery } from './entity/battery.js'
import { newDisplay } from './entity/display.js'
import { newGenerator } from './entity/generator.js'
import { newSmelter } from './entity/smelter.js'
import { newSolarPanel } from './entity/solar-panel.js'
import { newMiner } from './miner.js'
import { Vec2 } from './vec2.js'

export interface EntityConfig {
  init(args: Omit<BuildEntity, 'type'>): BuildEntity
  color: string
  size: Vec2
}

export const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  [EntityType.Miner]: {
    init: (args) => newMiner({ ...args, target: null }),
    color: '#2176AE',
    size: new Vec2(2, 2),
  },
  [EntityType.Generator]: {
    init: (args) => newGenerator({ ...args }),
    color: '#FBB13C',
    size: new Vec2(3, 2),
  },
  [EntityType.SolarPanel]: {
    init: (args) => newSolarPanel({ ...args }),
    color: '#CDC392',
    size: new Vec2(3, 3),
  },
  [EntityType.Battery]: {
    init: (args) => newBattery({ ...args }),
    color: '#78D5D7',
    size: new Vec2(1, 1),
  },
  [EntityType.Display]: {
    init: (args) => newDisplay({ ...args }),
    color: '#F7F9F9',
    size: new Vec2(1, 1),
  },
  [EntityType.Smelter]: {
    init: (args) =>
      newSmelter({
        ...args,
        target: null,
        input: null,
        output: null,
      }),
    color: '#688E26',
    size: new Vec2(2),
  },
  [EntityType.Belt]: {
    init: (args) => newBelt({ ...args }),
    color: '#3D348B',
    size: new Vec2(1),
  },
}
