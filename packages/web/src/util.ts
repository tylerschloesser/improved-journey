import invariant from 'tiny-invariant'
import { EntityId, EntityType } from './entity-types.js'
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
  const match = chunkId.match(/(-?\d+)\.(-?\d+)/)
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

function getCellArgs(position: Vec2) {
  const scaled = position.div(CHUNK_SIZE).floor()
  const chunkId = toChunkId(scaled)

  const modded = position.mod(CHUNK_SIZE)
  const index = modded.y * CHUNK_SIZE + modded.x
  invariant(index >= 0)

  return { chunkId, index }
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
  const { chunkId, index } = getCellArgs(position)
  const chunk = chunks[chunkId]
  invariant(chunk)
  let cell = chunk.cells[index] ?? { entityId: null, nodes: [] }
  invariant(cell.entityId === null)
  cell.entityId = entityId
  chunk.cells[index] = cell
}

export function setNodes({
  nodes,
  entityId,
  world,
}: {
  nodes: Vec2[]
  entityId: EntityId
  world: World
}): void {
  for (const position of nodes) {
    const { chunkId, index } = getCellArgs(position)
    const chunk = world.chunks[chunkId]
    invariant(chunk)
    const cell = chunk.cells[index] ?? { entityId: null, nodes: [] }
    if (!cell.nodes.find((node) => node.entityId === entityId)) {
      cell.nodes.push({ entityId })
    }
    chunk.cells[index] = cell

    if (cell.entityId) {
      const neighbor = world.entities[cell.entityId]
      invariant(neighbor)
      if (neighbor.type === EntityType.Belt && neighbor.next === null) {
        neighbor.next = { entityId }
      }
    }
  }
}

export function cellIndexToPosition(chunk: Chunk, index: number) {
  // TODO could memoize chunkIdToPosition to be faster
  return chunkIdToPosition(chunk.id)
    .mul(CHUNK_SIZE)
    .add(new Vec2(index % CHUNK_SIZE, Math.floor(index / CHUNK_SIZE)))
}

export function fixVec2(obj: any): any {
  // Vec2s get converted to plain objects during structured clone
  // Look for the __type key and turn them back into Vec2s

  for (const entry of Object.entries(obj)) {
    const [key, value] = entry
    if (key === '__type' && value === 'Vec2') {
      invariant(typeof obj.x === 'number')
      invariant(typeof obj.y === 'number')
      return new Vec2(obj.x, obj.y)
    } else if (value && typeof value === 'object') {
      obj[key] = fixVec2(value)
    }
  }
  return obj
}
