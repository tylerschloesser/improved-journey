import invariant from 'tiny-invariant'
import { EntityId } from './entity-types.js'
import { Cell, CellId, Chunk, ChunkId, World } from './types.js'
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

function updateCell(
  {
    position,
    chunks,
  }: {
    position: Vec2
    chunks: World['chunks']
  },
  callback: (cell: Cell | null) => Cell | null,
): void {
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

  chunk.cells[index] = callback(chunk.cells[index])
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
  updateCell({ position, chunks }, (cell) => {
    if (!cell) {
      cell = { entityId: null, nodes: [] }
    }
    invariant(cell.entityId === null)
    cell.entityId = entityId
    return cell
  })
}

export function setNodes({
  nodes,
  entityId,
  chunks,
}: {
  nodes: Vec2[]
  entityId: EntityId
  chunks: World['chunks']
}): void {
  for (const position of nodes) {
    updateCell({ position, chunks }, (cell) => {
      if (!cell) {
        cell = { entityId: null, nodes: [] }
      }
      const entityIds = new Set(cell.nodes.map((node) => node.entityId))
      entityIds.add(entityId)

      cell.nodes = Array.from(entityIds).map((entityId) => ({ entityId }))
      return cell
    })
  }
}

export function cellIndexToPosition(chunk: Chunk, index: number) {
  return chunkIdToPosition(chunk.id).add(
    new Vec2(index % CHUNK_SIZE, Math.floor(index / CHUNK_SIZE)),
  )
}
