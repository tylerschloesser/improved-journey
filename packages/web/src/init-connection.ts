import { isEqual } from 'lodash-es'
import { Graphics } from 'pixi.js'
import { combineLatest, distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { newBelt } from './belt.js'
import {
  buildConnection$,
  connection$,
  entities$,
  nextEntityId$,
  occupiedCellIds$,
  PIXI,
  position$,
} from './game-state.js'
import { InitArgs } from './init-args.js'
import { Entity, EntityNode } from './types.js'
import { toCellId } from './util.js'
import { Vec2 } from './vec2.js'

interface Selected {
  node: EntityNode
}

enum GraphicsKey {
  Nodes,
  Selected,
  Belt,
}

const gcache = new Map<GraphicsKey, Graphics>()

function destroyGraphics(key: GraphicsKey) {
  const g = gcache.get(key)
  if (g) {
    PIXI.container.world.removeChild(g)
    gcache.delete(key)
  }
}

function createGraphics(key: GraphicsKey): Graphics {
  destroyGraphics(key)
  const g = new Graphics()
  PIXI.container.world.addChild(g)
  gcache.set(key, g)
  return g
}

export function initConnection(_args: InitArgs) {
  const entity$ = combineLatest([connection$, entities$]).pipe(
    map(([connection, entities]) =>
      connection ? entities[connection.entityId] : null,
    ),
    distinctUntilChanged<Entity | null>(isEqual),
  )

  entity$.subscribe((entity) => {
    if (entity === null) {
      destroyGraphics(GraphicsKey.Nodes)
      return
    }

    const g = createGraphics(GraphicsKey.Nodes)

    g.beginFill('hsla(180, 50%, 50%, .5)')
    for (const node of entity.nodes) {
      const { x, y } = node.position
      g.drawRect(x, y, 1, 1)
    }
  })

  const selected$ = combineLatest([entity$, position$]).pipe(
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

  const belt$ = combineLatest([
    selected$,
    position$.pipe(
      map((position) => position.floor()),
      distinctUntilChanged<Vec2>(isEqual),
    ),
    occupiedCellIds$,
    nextEntityId$,
  ]).pipe(
    map(([selected, position, occupiedCellIds, nextEntityId]) => {
      if (selected === null) return null

      let dp = position.sub(selected.node.position)

      if (Math.abs(dp.x) >= Math.abs(dp.y)) {
        dp = new Vec2(dp.x, 0)
      } else {
        dp = new Vec2(0, dp.y)
      }

      const norm = dp.norm()

      const cells: { entity: Entity; valid: boolean }[] = []
      while (true) {
        const p = selected.node.position.add(dp)
        cells.push({
          entity: newBelt({
            id: `${nextEntityId++}`,
            color: 'yellow',
            position: p,
            size: new Vec2(1),
          }),
          valid: !occupiedCellIds.has(toCellId(p)),
        })
        if (dp.len() === 0) {
          break
        }
        dp = dp.sub(norm)
      }

      return {
        valid: cells.every((cell) => cell.valid),
        cells,
        nextEntityId,
      }
    }),
  )

  belt$.subscribe((belt) => {
    buildConnection$.next(belt)
  })

  belt$.subscribe((belt) => {
    if (belt === null) {
      destroyGraphics(GraphicsKey.Belt)
      return
    }

    const g = createGraphics(GraphicsKey.Belt)

    for (const cell of belt.cells) {
      if (cell.valid) {
        g.beginFill('hsla(100, 50%, 50%, .5)')
      } else {
        g.beginFill('hsla(0, 50%, 50%, .5)')
      }
      g.drawRect(cell.entity.position.x, cell.entity.position.y, 1, 1)
    }
  })

  selected$.subscribe((selected) => {
    if (selected === null) {
      destroyGraphics(GraphicsKey.Selected)
      return
    }

    const g = createGraphics(GraphicsKey.Selected)

    g.beginFill('green')
    const { x, y } = selected.node.position
    g.drawRect(x, y, 1, 1)
  })
}
