import invariant from 'tiny-invariant'
import { EntityId } from './entity-types.js'
import { CellId, Chunk, ChunkId, World } from './types.js'
import { Vec2 } from './vec2.js'

// https://www.geeksforgeeks.org/find-two-rectangles-overlap/#
//
// [less|greater] than or equals because we don't consider rectangles
// that touch to be intersecting.
//
export function intersects(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  if (a1.x >= b2.x || a2.x >= b1.x) {
    return false
  }
  if (a1.y >= b2.y || a2.y >= b1.y) {
    return false
  }
  return true
}

export function toCellId(position: Vec2): CellId {
  return `${position.x}.${position.y}`
}

export const CHUNK_SIZE = 10

export function toChunkId(position: Vec2): ChunkId {
  return `${position.x}.${position.y}`
}

export function chunkIdToPosition(chunkId: ChunkId): Vec2 {
  const match = chunkId.match(/(\d+)\.(\d+)/)
  invariant(match?.length === 3)
  const [x, y] = match.slice(1)
  return new Vec2(parseInt(x), parseInt(y))
}

export function generateChunk(id: ChunkId): Chunk {
  return {
    id,
    cells: new Array(CHUNK_SIZE ** 2).fill(null),
  }
}

export function setEntityId({
  position,
  entityId,
  chunks,
}: {
  position: Vec2
  entityId: EntityId
  chunks: World['chunks']
}) {
  const scaled = position.div(CHUNK_SIZE).floor()
  const chunkId = toChunkId(scaled)

  const modded = position.mod(CHUNK_SIZE)
  const index = modded.y * CHUNK_SIZE + modded.x
  invariant(index >= 0)

  let chunk = chunks[chunkId]
  if (!chunk) {
    chunk = chunks[chunkId] = generateChunk(chunkId)
  }

  invariant(index < chunk.cells.length)
  chunk.cells[index] = { entityId, nodeIds: [] }
}
