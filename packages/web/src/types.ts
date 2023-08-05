import { Entity, EntityId } from './entity-types.js'

export type ChunkId = string
export type NodeId = string

interface Tile {
  entityId: EntityId
  nodeIds: NodeId[]
}

export interface Chunk {
  id: ChunkId
  tiles: (Tile | null)[]
}

export interface World {
  tick: number

  chunks: Record<ChunkId, Chunk>
  entities: Record<EntityId, Entity>

  nextEntityId: number
}
