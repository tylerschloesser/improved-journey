import {
  AssemblerEntity,
  BatteryEntity,
  BeltEntity,
  DisplayEntity,
  Entity,
  EntityState,
  EntityStateType,
  EntityType,
  GeneratorEntity,
  LabEntity,
  MinerEntity,
  RobotStationEntity,
  SmelterEntity,
  SolarPanelEntity,
  StorageEntity,
} from './entity-types.js'
import { Vec2 } from './vec2.js'

const DEFAULT_STATE: EntityState = { type: EntityStateType.Build, input: {} }

type InitEntityFn<T extends Entity> = (
  args: Partial<Omit<T, 'id'>> & Pick<T, 'position'>,
) => Omit<T, 'id'>

const initMiner: InitEntityFn<MinerEntity> = (args) => ({
  state: DEFAULT_STATE,
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
})

const initGenerator: InitEntityFn<GeneratorEntity> = (args) => ({
  state: DEFAULT_STATE,
  ...args,
  type: EntityType.Generator,
  fuel: null,
  burning: null,
  connections: {
    input: new Set(),
    output: new Set(),
  },
  size: ENTITY_CONFIG[EntityType.Generator].initialSize,
})

const initSolarPanel: InitEntityFn<SolarPanelEntity> = (args) => ({
  state: DEFAULT_STATE,
  ...args,
  type: EntityType.SolarPanel,
  connections: {
    input: new Set(),
    output: new Set(),
  },
  size: ENTITY_CONFIG[EntityType.SolarPanel].initialSize,
})

const initBattery: InitEntityFn<BatteryEntity> = (args) => ({
  state: DEFAULT_STATE,
  ...args,
  type: EntityType.Battery,
  charge: 0,
  connections: {
    input: new Set(),
    output: new Set(),
  },
  size: ENTITY_CONFIG[EntityType.Battery].initialSize,
})

const initDisplay: InitEntityFn<DisplayEntity> = (args) => ({
  state: DEFAULT_STATE,
  content: null,
  ...args,
  type: EntityType.Display,
  connections: {
    input: new Set(),
    output: new Set(),
  },
  size: ENTITY_CONFIG[EntityType.Display].initialSize,
})

const initSmelter: InitEntityFn<SmelterEntity> = (args) => ({
  state: DEFAULT_STATE,
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
})

const initBelt: InitEntityFn<BeltEntity> = (args) => ({
  state: DEFAULT_STATE,
  ...args,
  type: EntityType.Belt,
  items: [],
  connections: {
    input: new Set(),
    output: new Set(),
  },
  direction: 'right',
  size: ENTITY_CONFIG[EntityType.Belt].initialSize,
})

const initStorage: InitEntityFn<StorageEntity> = (args) => ({
  state: DEFAULT_STATE,
  ...args,
  type: EntityType.Storage,
  connections: {
    input: new Set(),
    output: new Set(),
  },
  items: {},
  size: ENTITY_CONFIG[EntityType.Storage].initialSize,
})

const initLab: InitEntityFn<LabEntity> = (args) => ({
  state: DEFAULT_STATE,
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
})

const initRobotStation: InitEntityFn<RobotStationEntity> = (args) => ({
  state: DEFAULT_STATE,
  ...args,
  type: EntityType.RobotStation,
  connections: {
    input: new Set(),
    output: new Set(),
  },
  robotIds: new Set(),
  size: ENTITY_CONFIG[EntityType.RobotStation].initialSize,
})

const initAssembler: InitEntityFn<AssemblerEntity> = (args) => ({
  state: DEFAULT_STATE,
  ...args,
  type: EntityType.Assembler,
  connections: {
    input: new Set(),
    output: new Set(),
  },
  input: {},
  progress: null,
  size: ENTITY_CONFIG[EntityType.Assembler].initialSize,
})

export const ENTITY_CONFIG = {
  [EntityType.Miner]: {
    init: initMiner,
    color: '#2176AE',
    initialSize: new Vec2(2, 2).toSimple(),
  },

  [EntityType.Generator]: {
    init: initGenerator,
    color: '#FBB13C',
    initialSize: new Vec2(3, 2).toSimple(),
  },

  [EntityType.SolarPanel]: {
    init: initSolarPanel,
    color: '#CDC392',
    initialSize: new Vec2(3, 3).toSimple(),
  },

  [EntityType.Battery]: {
    init: initBattery,
    color: '#78D5D7',
    initialSize: new Vec2(1, 1).toSimple(),
  },

  [EntityType.Display]: {
    init: initDisplay,
    color: '#F7F9F9',
    initialSize: new Vec2(3, 2).toSimple(),
  },

  [EntityType.Smelter]: {
    init: initSmelter,
    color: '#688E26',
    initialSize: new Vec2(2).toSimple(),
  },

  [EntityType.Belt]: {
    init: initBelt,
    color: '#3D348B',
    initialSize: new Vec2(1).toSimple(),
  },

  [EntityType.Storage]: {
    init: initStorage,
    color: '#DCF763',
    initialSize: new Vec2(1).toSimple(),
  },

  [EntityType.Lab]: {
    init: initLab,
    color: '#FFD447',
    initialSize: new Vec2(3).toSimple(),
  },

  [EntityType.Assembler]: {
    init: initAssembler,
    color: '#BC9CB0',
    initialSize: new Vec2(3).toSimple(),
  },

  [EntityType.RobotStation]: {
    init: initRobotStation,
    color: '#854D27',
    initialSize: new Vec2(4).toSimple(),
  },
}
