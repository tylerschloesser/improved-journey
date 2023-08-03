import { Graphics } from 'pixi.js'
import { combineLatest } from 'rxjs'
import { EntityId } from './entity-types.js'
import {
  cellSize$,
  cursor$,
  entities$,
  PIXI,
  position$,
  viewport$,
} from './game-state.js'
import { InitArgs } from './init-args.js'
import { initBuild } from './init-build.js'
import { initConnection } from './init-connection.js'
import { initGame } from './init-game.js'
import { initGrid } from './init-grid.js'
import { initInput } from './input.js'
import { ZIndex } from './z-index.js'

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

function initEntities(_args: InitArgs) {
  const cache = new Map<EntityId, Graphics>()

  const container = PIXI.container.world

  entities$.subscribe((entities) => {
    Object.values(entities).forEach((entity) => {
      let g = cache.get(entity.id)
      if (!g) {
        g = new Graphics()
        cache.set(entity.id, g)

        g.beginFill(entity.color)
        const { x, y } = entity.position
        g.drawRect(x, y, entity.size.x, entity.size.y)

        container.addChild(g)
      }
    })
  })
}

function initPixi({ app }: InitArgs): void {
  app.stage.addChild(PIXI.container.world)

  const container = PIXI.container.world
  container.zIndex = 1

  combineLatest([position$, cellSize$, viewport$]).subscribe(
    ([position, cellSize, viewport]) => {
      const { x, y } = position.mul(cellSize * -1).add(viewport.div(2))
      container.position.set(x, y)
      container.scale.set(cellSize)
    },
  )
}

export function init(args: InitArgs): void {
  initPixi(args)
  initInput(args)
  initGrid(args)
  initGame(args)
  initCursor(args)
  initBuild(args)
  initEntities(args)
  initConnection(args)
}
