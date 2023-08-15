import { clamp, invokeMap } from 'lodash-es'
import invariant from 'tiny-invariant'
import { MAX_CELL_SIZE, MIN_CELL_SIZE } from './const.js'
import { Direction, Entity, EntityId } from './entity-types.js'
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
  const match = chunkId.match(/(-?\d+)\.(-?\d+)/)
  invariant(match?.length === 3)
  const [x, y] = match.slice(1)
  invariant(x)
  invariant(y)
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
  let chunk = chunks[chunkId]
  if (!chunk) {
    chunk = chunks[chunkId] = generateChunk(chunkId)
  }
  invariant(chunk)
  let cell = chunk.cells[index] ?? { entityId: null, nodes: [] }
  invariant(cell.entityId === null)
  cell.entityId = entityId
  chunk.cells[index] = cell
}

export function cellIndexToPosition(chunk: Chunk, index: number) {
  // TODO could memoize chunkIdToPosition to be faster
  return chunkIdToPosition(chunk.id)
    .mul(CHUNK_SIZE)
    .add(new Vec2(index % CHUNK_SIZE, Math.floor(index / CHUNK_SIZE)))
}

export function getCell(position: Vec2, chunks: World['chunks']): Cell | null {
  const { chunkId, index } = getCellArgs(position)
  const chunk = chunks[chunkId]
  return chunk?.cells[index] ?? null
}

export function getEntity(position: Vec2, world: World): Entity | null {
  const cell = getCell(position, world.chunks)
  if (cell?.entityId) {
    const entity = world.entities[cell.entityId]
    invariant(entity)
    return entity
  }
  return null
}

export function vec2ToDirection({ x, y }: Vec2): Direction {
  if (x === 0 && y === -1) return 'up'
  if (x === 1 && y === 0) return 'right'
  if (x === 0 && y === 1) return 'down'
  if (x === -1 && y === 0) return 'left'
  throw `not a valid direction: (${x},${y})}`
}

export function directionToVec2(direction: Direction): Vec2 {
  switch (direction) {
    case 'up':
      return new Vec2(0, -1)
    case 'right':
      return new Vec2(1, 0)
    case 'down':
      return new Vec2(0, 1)
    case 'left':
      return new Vec2(-1, 0)
  }
}

export function directionToAngle(direction: Direction): number {
  switch (direction) {
    case 'up':
      return -90
    case 'right':
      return 0
    case 'down':
      return 90
    case 'left':
      return 180
  }
}

export interface SelectArea {
  start: Vec2
  end: Vec2
}

export function getSelectArea(start: Vec2, end: Vec2) {
  return {
    start: new Vec2(Math.min(end.x, start.x), Math.min(end.y, start.y)),
    end: new Vec2(Math.max(end.x, start.x + 1), Math.max(end.y, start.y + 1)),
  }
}

export function clampCellSize(value: number) {
  return clamp(value, MIN_CELL_SIZE, MAX_CELL_SIZE)
}

export function zoomToCellSize(zoom: number) {
  return MIN_CELL_SIZE + (MAX_CELL_SIZE - MIN_CELL_SIZE) * zoom
}

export function cellSizeToZoom(cellSize: number) {
  invariant(cellSize >= MIN_CELL_SIZE)
  invariant(cellSize <= MAX_CELL_SIZE)

  return (cellSize - MIN_CELL_SIZE) / (MAX_CELL_SIZE - MIN_CELL_SIZE)
}
