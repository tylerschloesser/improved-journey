import { isEqual } from 'lodash-es'
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { newBelt } from './belt.js'
import { Entity } from './entity-types.js'
import {
  cells$,
  chunks$,
  connection$,
  entities$,
  position$,
} from './game-state.js'
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

export const buildConnection$ = new BehaviorSubject<{
  cells: { entity: Omit<Entity, 'id'> }[]
  valid: boolean
} | null>(null)

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

  const build: {
    cells: { entity: Omit<Entity, 'id'> }[]
    valid: boolean
  } = {
    cells: [],
    valid: true,
  }

  let cur = start
  do {
    build.cells.push({
      entity: newBelt({
        color: 'yellow',
        position: cur,
        size: new Vec2(1),
      }),
    })

    const valid = !cells.get(toCellId(cur))?.entityId
    build.valid &&= valid

    cur = cur.add(step)
  } while (!cur.equals(end))

  if (build.valid) {
    const last = build.cells.at(-1)
    invariant(last)
    const target = cells.get(toCellId(last.entity.position))
    build.valid &&= !!target
    if (target) {
      // for now, only allow to connect to node for other entities
      build.valid &&=
        target.nodes.length > 0 &&
        !target.nodes.find((node) => node.entityId === entity.id)
    }
  }

  buildConnection$.next(build)
})
