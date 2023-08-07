import { ItemType } from './item-types.js'
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
  color: string
}

export interface MinerEntity extends BaseEntity {
  type: EntityType.Miner
  target: ItemType | null
  progress: number
  output: { type: ItemType; count: number } | null
}

export interface BeltEntity extends BaseEntity {
  type: EntityType.Belt
  prev: EntityId
  next: EntityId
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

export type BuildEntity =
  | Omit<MinerEntity, 'id'>
  | (Omit<BeltEntity, 'id' | 'prev' | 'next'> & {
      prev?: EntityId
      next?: EntityId
    })
  | Omit<GeneratorEntity, 'id'>
  | Omit<SolarPanelEntity, 'id'>
  | Omit<BatteryEntity, 'id'>
  | Omit<DisplayEntity, 'id'>
  | Omit<SmelterEntity, 'id'>
