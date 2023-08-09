import { Entity, EntityId } from './entity-types.js'
import { SimpleVec2, Vec2 } from './vec2.js'

export type ChunkId = string
export type NodeId = string
export type CellId = string
export type ConnectionId = string

export interface Node {
  entityId: EntityId
}

export interface Cell {
  entityId: EntityId | null
  nodes: Node[]
}

export interface Chunk {
  id: ChunkId
  cells: (Cell | null)[]
}

export interface World {
  version: number
  tick: number

  chunks: Partial<Record<ChunkId, Chunk>>
  entities: Record<EntityId, Entity>

  nextEntityId: number
}

export interface Client {
  position: SimpleVec2
  zoom: number
}

export interface TickRequest {
  world: World
}

export interface TickResponse {
  world: World
  satisfaction: number
}
