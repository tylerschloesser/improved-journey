import { Application, Container, Graphics, ICanvas } from 'pixi.js'
import { combineLatest } from 'rxjs'
import {
  build$,
  cellSize$,
  cursor$,
  entities$,
  EntityId,
  translate$,
  viewport$,
} from './game-state.js'
import { initGame } from './init-game.js'
import { initGrid } from './init-grid.js'
import { initInput } from './input.js'
import { Vec2 } from './vec2.js'

interface InitArgs {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  app: Application<ICanvas>
}

function initCursor({ app }: InitArgs) {
  const circle = new Graphics()
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
  const rect = new Graphics()
  rect.visible = false

  rect.beginFill('blue')
  rect.drawRect(0, 0, 200, 200)

  app.stage.addChild(rect)

  cellSize$.subscribe((cellSize) => {
    rect.width = rect.height = cellSize * 2
  })

  combineLatest([build$, translate$]).subscribe(([build, translate]) => {
    if (build === null) {
      rect.visible = false
      return
    }

    const { x, y } = translate(build.position)

    rect.position.set(x, y)
    rect.visible = true
  })
}

function initEntities({ app }: InitArgs) {
  const cache = new Map<EntityId, Graphics>()

  const container = new Container()
  app.stage.addChild(container)

  combineLatest([entities$, cellSize$]).subscribe(([entities, cellSize]) => {
    Object.values(entities).forEach((entity) => {
      let g = cache.get(entity.id)
      if (!g) {
        g = new Graphics()
        cache.set(entity.id, g)

        g.beginFill('pink')
        g.drawRect(0, 0, 1, 1)

        container.addChild(g)
      }

      const { x, y } = entity.position.mul(cellSize)
      g.position.set(x, y)

      g.width = cellSize * entity.size.x
      g.height = cellSize * entity.size.y
    })
  })

  translate$.subscribe((translate) => {
    const { x, y } = translate(new Vec2(0, 0))
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
