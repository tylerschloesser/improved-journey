import { isEqual } from 'lodash-es'
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { newBelt } from './belt.js'
import {
  BuildBeltEntity,
  BuildEntity,
  Entity,
  EntityId,
  EntityIdRefType,
} from './entity-types.js'
import {
  cells$,
  chunks$,
  connection$,
  entities$,
  position$,
} from './game-state.js'
import { Cell, CellId } from './types.js'
import { cellIndexToPosition, toCellId } from './util.js'
import { Vec2 } from './vec2.js'

interface Selected {
  node: Vec2
}

const entity$ = combineLatest([connection$, entities$]).pipe(
  map(([connection, entities]) =>
    connection ? entities[connection.entityId] : null,
  ),
  distinctUntilChanged<Entity | null>(isEqual),
)

export const nodes$ = combineLatest([entity$, chunks$]).pipe(
  map(([entity, chunks]) => {
    if (entity === null) return null
    const nodes: {
      source: Vec2[]
      target: Vec2[]
    } = {
      source: [],
      target: [],
    }
    for (const chunk of Object.values(chunks)) {
      for (let i = 0; i < chunk.cells.length; i++) {
        const cell = chunk.cells[i]
        if (!cell) continue
        if (cell.nodes.find((node) => node.entityId === entity.id)) {
          nodes.source.push(cellIndexToPosition(chunk, i))
        } else if (cell.nodes.length > 0) {
          nodes.target.push(cellIndexToPosition(chunk, i))
        }
      }
    }
    return nodes
  }),
)

export const selected$ = combineLatest([nodes$, position$]).pipe(
  map(([nodes, position]) => {
    if (nodes === null) return null

    let closest: { node: Vec2; dist: number } | null = null
    for (const node of nodes.source) {
      const dist = position.sub(node.add(new Vec2(0.5))).len()

      if (closest === null || dist < closest.dist) {
        closest = { node, dist }
      }
    }
    invariant(closest)
    return { node: closest.node }
  }),
  distinctUntilChanged<Selected | null>(isEqual),
)

interface BuildConnection<T = BuildEntity> {
  source: EntityId
  cells: { entity: T }[]
  valid: boolean
}

export const buildConnection$ = new BehaviorSubject<BuildConnection | null>(
  null,
)

function getEntityIdForNode(
  node: Vec2,
  cells: Map<CellId, Cell>,
): EntityId | null {
  const cell = cells.get(toCellId(node))
  if (!cell) return null

  // TODO don't currently support > 1 entities per node
  invariant(cell.nodes.length < 2)

  if (cell.nodes.length === 0) {
    return null
  }

  return cell.nodes[0].entityId
}

combineLatest([
  entity$,
  selected$,
  position$.pipe(
    map((position) => position.floor()),
    distinctUntilChanged<Vec2>(isEqual),
  ),
  cells$,
]).subscribe(([entity, selected, position, cells]) => {
  if (entity === null || selected === null) {
    buildConnection$.next(null)
    return
  }

  const start = selected.node

  let delta = position.sub(start)
  if (Math.abs(delta.x) >= Math.abs(delta.y)) {
    delta = new Vec2(delta.x, 0)
  } else {
    delta = new Vec2(0, delta.y)
  }

  const step = delta.norm()
  const end = start.add(delta)

  const source = getEntityIdForNode(start, cells)
  invariant(source)

  const build: BuildConnection<BuildBeltEntity> = {
    source,
    cells: [],
    valid: true,
  }

  let cur = start

  do {
    build.cells.push({
      entity: newBelt({
        position: cur,
        size: new Vec2(1),
      }),
    })

    const valid = !cells.get(toCellId(cur))?.entityId
    build.valid &&= valid

    cur = cur.add(step)
  } while (!cur.equals(end))

  for (let i = 0; i < build.cells.length; i++) {
    const cell = build.cells[i]
    const last = i === build.cells.length - 1
    if (last) {
      const target = getEntityIdForNode(cell.entity.position, cells)
      if (target) {
        cell.entity.next = {
          entityId: {
            type: EntityIdRefType.Actual,
            actual: target,
          },
        }
      }
    } else {
      cell.entity.next = {
        entityId: {
          type: EntityIdRefType.Replace,
          replace: i + 1,
        },
      }
    }
  }

  buildConnection$.next(build)
})
