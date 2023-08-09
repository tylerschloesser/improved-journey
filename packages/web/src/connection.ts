import { isEqual } from 'lodash-es'
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { getNodes } from './add-entities.js'
import { newBelt } from './belt.js'
import { BeltEntity, Entity, EntityId } from './entity-types.js'
import {
  cells$,
  connection$,
  entities$,
  position$,
  world$,
} from './game-state.js'
import { Cell, CellId } from './types.js'
import { toCellId, vec2ToDirection } from './util.js'
import { Vec2 } from './vec2.js'

const entity$ = combineLatest([connection$, entities$]).pipe(
  map(([connection, entities]) =>
    connection ? entities[connection.entityId] : null,
  ),
  distinctUntilChanged<Entity | null>(isEqual),
)

export const nodes$ = combineLatest([entity$, world$]).pipe(
  map(([entity, world]) => {
    if (entity === null) return null
    const nodes: {
      source: Vec2[]
      target: Vec2[]
    } = {
      source: [],
      target: [],
    }

    for (const other of Object.values(world.entities)) {
      const arr = other === entity ? nodes.source : nodes.target
      arr.push(...getNodes(other))
    }

    return nodes
  }),
)

export const start$ = combineLatest([world$, position$, connection$]).pipe(
  map(([world, position, connection]) => {
    if (!connection) return null
    const nodes = getNodes(world.entities[connection.entityId])

    let closest: { node: Vec2; dist: number } | null = null
    for (const node of nodes) {
      const dist = position.sub(node.add(new Vec2(0.5))).len()

      if (closest === null || dist < closest.dist) {
        closest = { node, dist }
      }
    }
    invariant(closest)

    return closest.node
  }),
)

interface BuildConnection {
  cells: { entity: Omit<BeltEntity, 'id'> }[]
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
  start$,
  position$.pipe(
    map((position) => position.floor()),
    distinctUntilChanged<Vec2>(isEqual),
  ),
  cells$,
]).subscribe(([entity, start, position, cells]) => {
  if (entity === null || start === null) {
    buildConnection$.next(null)
    return
  }

  let delta = position.sub(start)
  if (Math.abs(delta.x) >= Math.abs(delta.y)) {
    delta = new Vec2(delta.x, 0)
  } else {
    delta = new Vec2(0, delta.y)
  }

  const step = delta.norm()

  const direction = step.len() === 0 ? 'right' : vec2ToDirection(step)

  const end = start.add(delta)

  const build: BuildConnection = {
    cells: [],
    valid: true,
  }

  let cur = start

  do {
    build.cells.push({
      entity: newBelt({
        position: cur,
        size: new Vec2(1),
        direction,
      }),
    })

    const valid = !cells.get(toCellId(cur))?.entityId
    build.valid &&= valid

    cur = cur.add(step)
  } while (!cur.equals(end))

  buildConnection$.next(build)
})
