import { ItemType } from './item-types.js'
import { Vec2 } from './vec2.js'

export type EntityId = string

export interface EntityNode {
  position: Vec2
}

export enum EntityType {
  Miner = 'miner',
  Belt = 'belt',
  Generator = 'generator',
  SolarPanel = 'solar-panel',
  Battery = 'battery',
}

export interface BaseEntity {
  id: EntityId
  position: Vec2
  size: Vec2
  color: string

  // TODO move nodes to specific entities
  nodes: EntityNode[]
}

export interface MinerEntity extends BaseEntity {
  type: EntityType.Miner

  progress: number
  output: { type: ItemType; count: number } | null
}

export interface BeltEntity extends BaseEntity {
  type: EntityType.Belt
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

export type Entity =
  | MinerEntity
  | BeltEntity
  | GeneratorEntity
  | SolarPanelEntity
  | BatteryEntity
