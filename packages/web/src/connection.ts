import { isEqual } from 'lodash-es'
import { combineLatest, distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { newBelt } from './belt.js'
import { Entity, EntityNode } from './entity-types.js'
import { cells$, connection$, entities$, position$ } from './game-state.js'
import { toCellId } from './util.js'
import { Vec2 } from './vec2.js'

interface Selected {
  node: EntityNode
}

const entity$ = combineLatest([connection$, entities$]).pipe(
  map(([connection, entities]) =>
    connection ? entities[connection.entityId] : null,
  ),
  distinctUntilChanged<Entity | null>(isEqual),
)

export const selected$ = combineLatest([entity$, position$]).pipe(
  map(([entity, position]) => {
    if (entity === null) return null

    let closest: { node: EntityNode; dist: number } | null = null
    for (const node of entity.nodes) {
      const dist = position.sub(node.position.add(new Vec2(0.5))).len()

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

    let dp = position.sub(selected.node.position)

    if (Math.abs(dp.x) >= Math.abs(dp.y)) {
      dp = new Vec2(dp.x, 0)
    } else {
      dp = new Vec2(0, dp.y)
    }

    const norm = dp.norm()

    const build: {
      cells: { entity: Omit<Entity, 'id'>; valid: boolean }[]
    } = {
      cells: [],
    }
    while (true) {
      const p = selected.node.position.add(dp)
      build.cells.push({
        entity: newBelt({
          color: 'yellow',
          position: p,
          size: new Vec2(1),
        }),
        valid: !cells.get(toCellId(p))?.entityId,
      })
      if (dp.len() === 0) {
        break
      }
      dp = dp.sub(norm)
    }

    return {
      ...build,
      valid: build.cells.every((cell) => cell.valid),
    }
  }),
)
