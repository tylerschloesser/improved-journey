import { Application, Graphics, ICanvas } from 'pixi.js'
import { combineLatest } from 'rxjs'
import { cellSize$, miner$, position$ } from './game-state.js'

export function initGame({ app }: { app: Application<ICanvas> }) {
  const rect = new Graphics()
  app.stage.addChild(rect)

  rect.beginFill('red')
  rect.drawRect(0, 0, 100, 100)

  cellSize$.subscribe((cellSize) => {
    rect.width = rect.height = cellSize
  })

  combineLatest([miner$, position$, cellSize$]).subscribe(
    ([miner, position, cellSize]) => {
      const translate = miner.add(position).mul(cellSize)
      rect.position.set(translate.x, translate.y)
    },
  )
}
