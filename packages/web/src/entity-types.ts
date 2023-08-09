import { ItemStack, ItemType } from './item-types.js'
import { Node } from './types.js'
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

export interface BaseEntity {
  id: EntityId
  position: Vec2
  size: Vec2
}

export interface MinerEntity extends BaseEntity {
  type: EntityType.Miner
  target: ItemType | null
  progress: number
  output: {
    queue: ItemStack | null
    node: Node | null
  }
}

export interface BeltEntity extends BaseEntity {
  type: EntityType.Belt
  next: Node | null
  items: { type: ItemType; progress: number }[]
}

export interface GeneratorEntity extends BaseEntity {
  type: EntityType.Generator

  fuel: { type: ItemType; count: number } | null
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
  target: ItemType | null
  progress: number | null
  input: { type: ItemType; count: number } | null
  output: { type: ItemType; count: number } | null
}

export type Entity =
  | MinerEntity
  | BeltEntity
  | GeneratorEntity
  | SolarPanelEntity
  | BatteryEntity
  | DisplayEntity
  | SmelterEntity

export enum EntityIdRefType {
  Actual = 'actual',
  Replace = 'replace',
}

export type EntityIdRef =
  | {
      type: EntityIdRefType.Actual
      actual: EntityId
    }
  | {
      type: EntityIdRefType.Replace
      replace: number
    }

export type BuildBeltEntity = Omit<BeltEntity, 'id' | 'next'> & {
  next?: { entityId: EntityIdRef }
}

export type BuildEntity =
  | Omit<MinerEntity, 'id'>
  | BuildBeltEntity
  | Omit<GeneratorEntity, 'id'>
  | Omit<SolarPanelEntity, 'id'>
  | Omit<BatteryEntity, 'id'>
  | Omit<DisplayEntity, 'id'>
  | Omit<SmelterEntity, 'id'>
