import { isEqual } from 'lodash-es'
import { combineLatest, distinctUntilChanged, map } from 'rxjs'
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
    const nodes: Vec2[] = []
    for (const chunk of Object.values(chunks)) {
      for (let i = 0; i < chunk.cells.length; i++) {
        const cell = chunk.cells[i]
        if (cell?.nodes.find((node) => node.entityId === entity.id)) {
          nodes.push(cellIndexToPosition(chunk, i))
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
    for (const node of nodes) {
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

export const buildConnection$ = combineLatest([
  selected$,
  position$.pipe(
    map((position) => position.floor()),
    distinctUntilChanged<Vec2>(isEqual),
  ),
  cells$,
]).pipe(
  map(([selected, position, cells]) => {
    if (selected === null) return null

    let dp = position.sub(selected.node)

    if (Math.abs(dp.x) >= Math.abs(dp.y)) {
      dp = new Vec2(dp.x, 0)
    } else {
      dp = new Vec2(0, dp.y)
    }

    const norm = dp.norm()

    const build: {
      cells: { entity: Omit<Entity, 'id'> }[]
      valid: boolean
    } = {
      cells: [],
      valid: true,
    }
    while (true) {
      const p = selected.node.add(dp)
      build.cells.push({
        entity: newBelt({
          color: 'yellow',
          position: p,
          size: new Vec2(1),
        }),
      })
      const valid = !cells.get(toCellId(p))?.entityId
      build.valid &&= valid
      if (dp.len() === 0) {
        break
      }
      dp = dp.sub(norm)
    }

    return build
  }),
)
