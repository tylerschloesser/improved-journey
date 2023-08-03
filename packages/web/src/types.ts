import { Entity, EntityId } from './entity-types.js'

export type ChunkId = string

export interface Chunk {
  id: ChunkId
  tiles: (EntityId | null)[]
}

export interface World {
  tick: number

  chunks: Record<ChunkId, Chunk>
  entities: Record<EntityId, Entity>

  nextEntityId: number
}
