import { Entity, EntityId } from './entity-types.js'

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

export interface Connection {
  id: ConnectionId
  entityIds: [EntityId, EntityId]
  cellIds: CellId[]
}

export interface World {
  tick: number

  chunks: Record<ChunkId, Chunk>
  entities: Record<EntityId, Entity>
  connections: Record<ConnectionId, Connection>

  nextEntityId: number
}
