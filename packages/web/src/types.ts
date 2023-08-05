import { Entity, EntityId } from './entity-types.js'

export type ChunkId = string
export type NodeId = string
export type CellId = string

interface Cell {
  entityId: EntityId
  nodeIds: NodeId[]
}

export interface Chunk {
  id: ChunkId
  cells: (Cell | null)[]
}

export interface World {
  tick: number

  chunks: Record<ChunkId, Chunk>
  entities: Record<EntityId, Entity>

  nextEntityId: number
}
