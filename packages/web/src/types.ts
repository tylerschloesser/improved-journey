import { ItemType } from './item-types.js'
import { Vec2 } from './vec2.js'

export type EntityId = string
export type ChunkId = string

export interface Chunk {
  id: ChunkId
  tiles: (EntityId | null)[]
}

export interface EntityNode {
  position: Vec2
}

export enum EntityType {
  Miner = 'miner',
  Belt = 'belt',
  Generator = 'generator',
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
  output: { type: ItemType; count: number } | null
}

export interface BeltEntity extends BaseEntity {
  type: EntityType.Belt
}

export interface GeneratorEntity extends BaseEntity {
  type: EntityType.Generator
}

export type Entity = MinerEntity | BeltEntity | GeneratorEntity

export interface World {
  tick: number

  chunks: Record<ChunkId, Chunk>
  entities: Record<EntityId, Entity>

  nextEntityId: number
}
