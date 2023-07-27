import { Application, Graphics, ICanvas } from 'pixi.js'
import { combineLatest } from 'rxjs'
import { Build } from './component/build.js'
import {
  build$,
  cellSize$,
  cursor$,
  translate$,
  viewport$,
} from './game-state.js'
import { initGame } from './init-game.js'
import { initGrid } from './init-grid.js'
import { initInput } from './input.js'

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

export function init(args: InitArgs): void {
  initInput(args)
  initGrid(args)
  initGame(args)
  initCursor(args)
  initBuild(args)
}
