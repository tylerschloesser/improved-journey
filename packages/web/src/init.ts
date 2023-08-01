import { Container, Graphics } from 'pixi.js'
import { combineLatest } from 'rxjs'
import {
  Entity,
  EntityId,
  cellSize$,
  cursor$,
  entities$,
  viewport$,
  worldToScreen$,
  position$,
} from './game-state.js'
import { InitArgs } from './init-args.js'
import { initBuild } from './init-build.js'
import { initGame } from './init-game.js'
import { initGrid } from './init-grid.js'
import { initInput } from './input.js'
import { Vec2 } from './vec2.js'
import { ZIndex } from './z-index.js'
import { initConnection } from './init-connection.js'

function initCursor({ app }: InitArgs) {
  const circle = new Graphics()
  circle.zIndex = ZIndex.Cursor
  circle.visible = false

  circle.beginFill('hsla(0, 100%, 100%, .5)')
  circle.drawCircle(0, 0, 100)

  app.stage.addChild(circle)

  combineLatest([viewport$, cellSize$, cursor$]).subscribe(
    ([viewport, cellSize, cursor]) => {
      if (cursor.enabled === false) {
        circle.visible = false
        return
      }

      const { x, y } = viewport.div(2)

      circle.width = circle.height = cellSize / 2
      circle.position.set(x, y)
      circle.visible = true
    },
  )
}

function cacheGraphics({
  entity,
  cache,
  container,
}: {
  entity: Entity
  cache: Map<EntityId, Graphics>
  container: Container
}): Graphics {
  let g = cache.get(entity.id)
  if (!g) {
    g = new Graphics()
    cache.set(entity.id, g)

    g.beginFill(entity.color)
    g.drawRect(0, 0, entity.size.x, entity.size.y)

    container.addChild(g)
  }
  return g
}

function initEntities({ app }: InitArgs) {
  const cache = new Map<EntityId, Graphics>()

  const container = new Container()
  app.stage.addChild(container)

  entities$.subscribe((entities) => {
    Object.values(entities).forEach((entity) => {
      let g = cacheGraphics({ entity: entity, cache, container })
      const { x, y } = entity.position
      g.position.set(x, y)
    })
  })

  combineLatest([position$, cellSize$, viewport$]).subscribe(
    ([position, cellSize, viewport]) => {
      const { x, y } = position.mul(cellSize * -1).add(viewport.div(2))
      container.position.set(x, y)
      container.scale.set(cellSize)
    },
  )
}

export function init(args: InitArgs): void {
  initInput(args)
  initGrid(args)
  initGame(args)
  initCursor(args)
  initBuild(args)
  initEntities(args)
  initConnection(args)
}
