import { isEqual } from 'lodash-es'
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { getNodes } from './add-entities.js'
import { ENTITY_CONFIG } from './entity-config.js'
import { BeltEntity, Entity, EntityType } from './entity-types.js'
import {
  cells$,
  connection$,
  entities$,
  position$,
  world$,
} from './game-state.js'
import { toCellId, vec2ToDirection } from './util.js'
import { Vec2 } from './vec2.js'

const entity$ = combineLatest([connection$, entities$]).pipe(
  map(([connection, entities]) => {
    if (connection === null) return null
    const entity = entities[connection.entityId]
    invariant(entity)
    return entity
  }),
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
    const entity = world.entities[connection.entityId]
    invariant(entity)
    const nodes = getNodes(entity)

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
    // TODO cleanup type cast?
    const belt = ENTITY_CONFIG[EntityType.Belt].init({
      position: cur.toSimple(),
    }) as BeltEntity
    belt.direction = direction

    build.cells.push({ entity: belt })

    const valid = !cells.get(toCellId(cur))?.entityId
    build.valid &&= valid

    cur = cur.add(step)
  } while (!cur.equals(end))

  buildConnection$.next(build)
})
