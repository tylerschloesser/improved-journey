import { ItemStack, ItemType } from './item-types.js'
import { SimpleVec2 } from './vec2.js'

export type EntityId = string

export enum EntityType {
  Miner = 'miner',
  Belt = 'belt',
  Generator = 'generator',
  SolarPanel = 'solar-panel',
  Battery = 'battery',
  Display = 'display',
  Smelter = 'smelter',
  Storage = 'storage',
  Lab = 'lab',
  Assembler = 'assembler',
}

export type Direction = 'up' | 'right' | 'down' | 'left'

export interface EntityConnections {
  input: Set<EntityId>
  output: Set<EntityId>
}

export enum EntityStateType {
  Build = 'build',
  Active = 'active',
}

export interface BuildEntityState {
  type: EntityStateType.Build
  input: Partial<Record<ItemType, number>>
}

export interface ActiveEntityState {
  type: EntityStateType.Active
}

export type EntityState = BuildEntityState | ActiveEntityState

export type BaseEntity = {
  id: EntityId
  position: SimpleVec2
  size: SimpleVec2
  connections: EntityConnections
  state: EntityState
}
export type MinerEntity = BaseEntity & {
  type: EntityType.Miner
  target: ItemType | null
  progress: number
  output: ItemStack | null
}

export type BeltEntity = BaseEntity & {
  type: EntityType.Belt
  items: { type: ItemType; progress: number }[]
  direction: Direction
}

export type GeneratorEntity = BaseEntity & {
  type: EntityType.Generator
  fuel: ItemStack | null
  burning: { type: ItemType; progress: number } | null
}

export type SolarPanelEntity = BaseEntity & {
  type: EntityType.SolarPanel
}

export type BatteryEntity = BaseEntity & {
  type: EntityType.Battery
  charge: number
}

export enum DisplayContentType {
  Satisfaction = 'satisfaction',
}

export type DisplayEntity = BaseEntity & {
  type: EntityType.Display
  content: {
    type: DisplayContentType
  } | null
}

export type SmelterEntity = BaseEntity & {
  type: EntityType.Smelter
  progress: number | null
  target: ItemType | null
  input: ItemStack | null
  output: ItemStack | null
}

export type StorageEntity = BaseEntity & {
  type: EntityType.Storage
  items: Partial<Record<ItemType, number>>
}

export type LabEntity = BaseEntity & {
  type: EntityType.Lab
  input: ItemStack | null
  target: ItemType | null
  progress: number | null
}

export type AssemblerEntity = BaseEntity & {
  type: EntityType.Assembler
  input: Partial<Record<ItemType, number>>
  progress: number | null
}

export type Entity =
  | MinerEntity
  | BeltEntity
  | GeneratorEntity
  | SolarPanelEntity
  | BatteryEntity
  | DisplayEntity
  | SmelterEntity
  | StorageEntity
  | LabEntity
  | AssemblerEntity

export type BuildEntity =
  | Omit<MinerEntity, 'id'>
  | Omit<BeltEntity, 'id'>
  | Omit<GeneratorEntity, 'id'>
  | Omit<SolarPanelEntity, 'id'>
  | Omit<BatteryEntity, 'id'>
  | Omit<DisplayEntity, 'id'>
  | Omit<SmelterEntity, 'id'>
  | Omit<StorageEntity, 'id'>
  | Omit<LabEntity, 'id'>
  | Omit<AssemblerEntity, 'id'>
