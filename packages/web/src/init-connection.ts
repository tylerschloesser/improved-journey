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
  entity: Entity
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
      const { x, y } = node.position.add(entity.position)
      g.drawRect(x, y, 1, 1)
    }
  })

  const selected$ = combineLatest([entity$, position$]).pipe(
    map(([entity, position]) => {
      if (entity === null) return null

      let closest: { node: EntityNode; dist: number } | null = null
      for (const node of entity.nodes) {
        const dist = position
          .sub(entity.position.add(node.position).add(new Vec2(0.5)))
          .len()

        if (closest === null || dist < closest.dist) {
          closest = { node, dist }
        }
      }
      invariant(closest)
      return {
        node: closest.node,
        entity,
      }
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
      return [position]
    }),
  )

  belt$.subscribe((belt) => {
    if (belt === null) {
      destroyGraphics(GraphicsKey.Belt)
      return
    }

    const g = createGraphics(GraphicsKey.Belt)

    g.beginFill('hsla(0, 50%, 50%, .5)')
    for (const segment of belt) {
      g.drawRect(segment.x, segment.y, 1, 1)
    }
  })

  selected$.subscribe((selected) => {
    if (selected === null) {
      destroyGraphics(GraphicsKey.Selected)
      return
    }

    const g = createGraphics(GraphicsKey.Selected)

    g.beginFill('green')
    const { x, y } = selected.node.position.add(selected.entity.position)
    g.drawRect(x, y, 1, 1)
  })
}
