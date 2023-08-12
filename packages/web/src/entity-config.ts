import { newBelt } from './belt.js'
import {
  BeltEntity,
  BuildEntity,
  EntityType,
  StorageEntity,
} from './entity-types.js'
import { newBattery } from './entity/battery.js'
import { newDisplay } from './entity/display.js'
import { newGenerator } from './entity/generator.js'
import { newSmelter } from './entity/smelter.js'
import { newSolarPanel } from './entity/solar-panel.js'
import { newMiner } from './miner.js'
import { Vec2 } from './vec2.js'

export interface EntityConfig<T = BuildEntity> {
  init(args: Omit<T, 'type' | 'connections'>): T
  color: string
  size: Vec2
}

export const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  [EntityType.Miner]: {
    init: (args) =>
      newMiner({
        ...args,
        connections: {
          input: new Set(),
          output: new Set(),
        },
        target: null,
      }),
    color: '#2176AE',
    size: new Vec2(2, 2),
  },
  [EntityType.Generator]: {
    init: (args) =>
      newGenerator({
        ...args,
        connections: {
          input: new Set(),
          output: new Set(),
        },
      }),
    color: '#FBB13C',
    size: new Vec2(3, 2),
  },
  [EntityType.SolarPanel]: {
    init: (args) =>
      newSolarPanel({
        ...args,
        connections: {
          input: new Set(),
          output: new Set(),
        },
      }),
    color: '#CDC392',
    size: new Vec2(3, 3),
  },
  [EntityType.Battery]: {
    init: (args) =>
      newBattery({
        ...args,
        connections: {
          input: new Set(),
          output: new Set(),
        },
      }),
    color: '#78D5D7',
    size: new Vec2(1, 1),
  },
  [EntityType.Display]: {
    init: (args) =>
      newDisplay({
        ...args,
        connections: {
          input: new Set(),
          output: new Set(),
        },
      }),
    color: '#F7F9F9',
    size: new Vec2(2, 2),
  },
  [EntityType.Smelter]: {
    init: (args) =>
      newSmelter({
        ...args,
        connections: {
          input: new Set(),
          output: new Set(),
        },
        target: null,
        input: null,
        output: null,
      }),
    color: '#688E26',
    size: new Vec2(2),
  },
  [EntityType.Belt]: {
    init: (args) => newBelt(args),
    color: '#3D348B',
    size: new Vec2(1),
  } as EntityConfig<BeltEntity>,
  [EntityType.Storage]: {
    init: (args) => ({
      ...args,
      type: EntityType.Storage,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      items: {},
    }),
    color: '#DCF763',
    size: new Vec2(1),
  } as EntityConfig<StorageEntity>,
}
