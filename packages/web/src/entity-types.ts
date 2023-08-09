import { ItemStack, ItemType } from './item-types.js'
import { Vec2 } from './vec2.js'

export type EntityId = string

export enum EntityType {
  Miner = 'miner',
  Belt = 'belt',
  Generator = 'generator',
  SolarPanel = 'solar-panel',
  Battery = 'battery',
  Display = 'display',
  Smelter = 'smelter',
}

export interface EntityConnections {
  input: Set<EntityId>
  output: Set<EntityId>
}

export interface BaseEntity {
  id: EntityId
  position: Vec2
  size: Vec2
  connections: EntityConnections
}

export interface MinerEntity extends BaseEntity {
  type: EntityType.Miner
  target: ItemType | null
  progress: number
  output: ItemStack | null
}

export interface BeltEntity extends BaseEntity {
  type: EntityType.Belt
  items: { type: ItemType; progress: number }[]
}

export interface GeneratorEntity extends BaseEntity {
  type: EntityType.Generator
  fuel: ItemStack | null
  burning: { type: ItemType; progress: number } | null
}

export interface SolarPanelEntity extends BaseEntity {
  type: EntityType.SolarPanel
}

export interface BatteryEntity extends BaseEntity {
  type: EntityType.Battery
  charge: number
}

export enum DisplayContentType {
  Satisfaction = 'satisfaction',
}

export interface DisplayEntity extends BaseEntity {
  type: EntityType.Display
  content: {
    type: DisplayContentType
  }
}

export interface SmelterEntity extends BaseEntity {
  type: EntityType.Smelter
  progress: number | null
  target: ItemType | null
  input: ItemStack | null
  output: ItemStack | null
}

export type Entity =
  | MinerEntity
  | BeltEntity
  | GeneratorEntity
  | SolarPanelEntity
  | BatteryEntity
  | DisplayEntity
  | SmelterEntity

export type BuildEntity =
  | Omit<MinerEntity, 'id'>
  | Omit<BeltEntity, 'id'>
  | Omit<GeneratorEntity, 'id'>
  | Omit<SolarPanelEntity, 'id'>
  | Omit<BatteryEntity, 'id'>
  | Omit<DisplayEntity, 'id'>
  | Omit<SmelterEntity, 'id'>
