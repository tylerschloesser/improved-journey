import { combineLatest, map } from 'rxjs'
import { InitArgs } from './init-args.js'
import {
  cellSize$,
  connection$,
  entities$,
  worldToScreen$,
} from './game-state.js'
import { Vec2 } from './vec2.js'
import { Container, Graphics } from 'pixi.js'
import invariant from 'tiny-invariant'
import { ZIndex } from './z-index.js'

export function initConnection({ app }: InitArgs) {
  let container: Container | null = null
  // let g: Graphics | null = null

  const entity$ = combineLatest([connection$, entities$]).pipe(
    map(([connection, entities]) =>
      connection ? entities[connection.entityId] : null,
    ),
  )

  const points$ = entity$.pipe(
    map((entity) => {
      if (entity === null) return null

      const points: Vec2[] = []
      points.push(
        new Vec2(entity.position.x + entity.size.x, entity.position.y),
      )
      return points
    }),
  )

  combineLatest([points$, worldToScreen$, cellSize$]).subscribe(
    ([points, worldToScreen, cellSize]) => {
      if (points === null) {
        if (container) {
          app.stage.removeChild(container)
          container.destroy({ children: true })
          container = null
        }
        return
      }

      if (container === null) {
        container = new Container()
        container.zIndex = ZIndex.Connection
        app.stage.addChild(container)

        const g = new Graphics()
        g.lineStyle(0.1, 'orange')
        g.drawRect(0.05, 0.05, 1, 1)
        container.addChild(g)
      }

      const first = points[0]
      invariant(first)

      const { x, y } = worldToScreen(first)
      container.position.set(x, y)
      container.width = container.height = cellSize
    },
  )
}
