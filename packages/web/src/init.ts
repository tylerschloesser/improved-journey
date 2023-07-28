import { Application, Container, Graphics, ICanvas } from 'pixi.js'
import { combineLatest, withLatestFrom } from 'rxjs'
import {
  build$,
  cellSize$,
  cursor$,
  entities$,
  Entity,
  EntityId,
  viewport$,
  worldToScreen$,
} from './game-state.js'
import { initGame } from './init-game.js'
import { initGrid } from './init-grid.js'
import { initInput } from './input.js'
import { Vec2 } from './vec2.js'
import { ZIndex } from './z-index.js'

interface InitArgs {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  app: Application<ICanvas>
}

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

function initBuild({ app }: InitArgs) {
  let g: Graphics | null = null

  combineLatest([build$, worldToScreen$, cellSize$]).subscribe(
    ([build, worldToScreen, cellSize]) => {
      if (build === null) {
        if (g) {
          app.stage.removeChild(g)
          g.destroy()
          g = null
        }
        return
      }

      if (g === null) {
        g = new Graphics()

        g.zIndex = ZIndex.Build

        g.beginFill('blue')
        g.drawRect(0, 0, 200, 200)

        app.stage.addChild(g)
      }

      const { x, y } = worldToScreen(build.entity.position)

      g.width = g.height = cellSize * 2
      g.position.set(x, y)
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
    g.drawRect(0, 0, 1, 1)

    container.addChild(g)
  }
  return g
}

function initEntities({ app }: InitArgs) {
  const cache = new Map<EntityId, Graphics>()

  const container = new Container()
  app.stage.addChild(container)

  combineLatest([entities$, cellSize$]).subscribe(([entities, cellSize]) => {
    Object.values(entities).forEach((entity) => {
      let g = cacheGraphics({ entity: entity, cache, container })

      const { x, y } = entity.position.mul(cellSize)
      g.position.set(x, y)

      g.width = cellSize * entity.size.x
      g.height = cellSize * entity.size.y
    })
  })

  worldToScreen$.subscribe((worldToScreen) => {
    const { x, y } = worldToScreen(new Vec2(0, 0))
    container.position.set(x, y)
  })
}

export function init(args: InitArgs): void {
  initInput(args)
  initGrid(args)
  initGame(args)
  initCursor(args)
  initBuild(args)
  initEntities(args)
}
