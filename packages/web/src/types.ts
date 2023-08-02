import { Vec2 } from './vec2.js'

export interface RenderState {
  viewport: Vec2
  zoom: number
  position: Vec2
}

export type EntityId = string
export type SurfaceId = string
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

export interface Entity {
  id: EntityId
  type: EntityType
  position: Vec2
  size: Vec2
  color: string
  nodes: EntityNode[]
}

export interface World {
  tick: number

  chunks: Record<ChunkId, Chunk>
  entities: Record<EntityId, Entity>

  nextEntityId: number
}
