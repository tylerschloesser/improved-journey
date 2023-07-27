import { Application, Graphics, ICanvas } from 'pixi.js'
import { combineLatest } from 'rxjs'
import { cellSize$, miner$, translate$ } from './game-state.js'

export function initGame({ app }: { app: Application<ICanvas> }) {
  const rect = new Graphics()
  app.stage.addChild(rect)

  rect.beginFill('red')
  rect.drawRect(0, 0, 200, 200)

  cellSize$.subscribe((cellSize) => {
    rect.width = rect.height = cellSize * 2
  })

  combineLatest([miner$, translate$]).subscribe(([miner, translate]) => {
    const position = translate(miner)
    rect.position.set(position.x, position.y)
  })
}
