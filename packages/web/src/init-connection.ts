import { isEqual } from 'lodash-es'
import { Graphics } from 'pixi.js'
import { combineLatest, distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import {
  connection$,
  entities$,
  Entity,
  EntityNode,
  PIXI,
  position$,
} from './game-state.js'
import { InitArgs } from './init-args.js'
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
  ]).pipe(
    map(([selected, position]) => {
      if (selected === null) return null

      let dp = position.sub(selected.node.position)

      if (Math.abs(dp.x) >= Math.abs(dp.y)) {
        dp = new Vec2(dp.x, 0)
      } else {
        dp = new Vec2(0, dp.y)
      }

      const norm = dp.norm()

      const cells: Vec2[] = []
      while (dp.len() > 0) {
        cells.push(selected.node.position.add(dp))
        dp = dp.sub(norm)
      }

      return { cells }
    }),
  )

  belt$.subscribe((belt) => {
    if (belt === null) {
      destroyGraphics(GraphicsKey.Belt)
      return
    }

    const g = createGraphics(GraphicsKey.Belt)

    g.beginFill('hsla(0, 50%, 50%, .5)')
    for (const cell of belt.cells) {
      g.drawRect(cell.x, cell.y, 1, 1)
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
