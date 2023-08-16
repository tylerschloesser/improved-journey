import { BuildEntity, EntityType } from './entity-types.js'
import { SimpleVec2, Vec2 } from './vec2.js'

export interface EntityConfig<T = BuildEntity> {
  init(args: Omit<T, 'type' | 'connections' | 'size'>): T
  color: string
  initialSize: SimpleVec2
}

export const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  [EntityType.Miner]: {
    init: (args) => ({
      ...args,
      type: EntityType.Miner,
      progress: 0,
      output: null,
      target: null,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      size: ENTITY_CONFIG[EntityType.Miner].initialSize,
    }),
    color: '#2176AE',
    initialSize: new Vec2(2, 2).toSimple(),
  },

  [EntityType.Generator]: {
    init: (args) => ({
      ...args,
      type: EntityType.Generator,
      fuel: null,
      burning: null,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      size: ENTITY_CONFIG[EntityType.Generator].initialSize,
    }),
    color: '#FBB13C',
    initialSize: new Vec2(3, 2).toSimple(),
  },

  [EntityType.SolarPanel]: {
    init: (args) => ({
      ...args,
      type: EntityType.SolarPanel,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      size: ENTITY_CONFIG[EntityType.SolarPanel].initialSize,
    }),
    color: '#CDC392',
    initialSize: new Vec2(3, 3).toSimple(),
  },

  [EntityType.Battery]: {
    init: (args) => ({
      ...args,
      type: EntityType.Battery,
      charge: 0,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      size: ENTITY_CONFIG[EntityType.Battery].initialSize,
    }),
    color: '#78D5D7',
    initialSize: new Vec2(1, 1).toSimple(),
  },

  [EntityType.Display]: {
    init: (args) => ({
      ...args,
      type: EntityType.Display,
      content: null,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      size: ENTITY_CONFIG[EntityType.Display].initialSize,
    }),
    color: '#F7F9F9',
    initialSize: new Vec2(3, 2).toSimple(),
  },

  [EntityType.Smelter]: {
    init: (args) => ({
      ...args,
      type: EntityType.Smelter,
      progress: 0,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      target: null,
      input: null,
      output: null,
      size: ENTITY_CONFIG[EntityType.Smelter].initialSize,
    }),
    color: '#688E26',
    initialSize: new Vec2(2).toSimple(),
  },

  [EntityType.Belt]: {
    init: (args) => ({
      ...args,
      type: EntityType.Belt,
      items: [],
      connections: {
        input: new Set(),
        output: new Set(),
      },
      direction: 'right',
      size: ENTITY_CONFIG[EntityType.Belt].initialSize,
    }),
    color: '#3D348B',
    initialSize: new Vec2(1).toSimple(),
  },

  [EntityType.Storage]: {
    init: (args) => ({
      ...args,
      type: EntityType.Storage,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      items: {},
      size: ENTITY_CONFIG[EntityType.Storage].initialSize,
    }),
    color: '#DCF763',
    initialSize: new Vec2(1).toSimple(),
  },

  [EntityType.Lab]: {
    init: (args) => ({
      ...args,
      type: EntityType.Lab,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      progress: null,
      target: null,
      input: null,
      size: ENTITY_CONFIG[EntityType.Lab].initialSize,
    }),
    color: '#FFD447',
    initialSize: new Vec2(3).toSimple(),
  },

  [EntityType.Assembler]: {
    init: (args) => ({
      ...args,
      type: EntityType.Assembler,
      connections: {
        input: new Set(),
        output: new Set(),
      },
      input: {},
      progress: null,
      size: ENTITY_CONFIG[EntityType.Assembler].initialSize,
    }),
    color: '#BC9CB0',
    initialSize: new Vec2(3).toSimple(),
  },
}
