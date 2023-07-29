import { combineLatest, map } from 'rxjs'
import { InitArgs } from './init-args.js'
import {
  cellSize$,
  connection$,
  entities$,
  worldToScreen$,
} from './game-state.js'
import { Vec2 } from './vec2.js'
import { Graphics } from 'pixi.js'
import invariant from 'tiny-invariant'
import { ZIndex } from './z-index.js'

export function initConnection({ app }: InitArgs) {
  let g: Graphics | null = null

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
        if (g) {
          app.stage.removeChild(g)
          g.destroy()
          g = null
        }
        return
      }

      if (g === null) {
        g = new Graphics()
        g.beginFill('orange')
        g.drawRect(0, 0, 1, 1)
        g.zIndex = ZIndex.Connection
        app.stage.addChild(g)
      }

      const first = points[0]
      invariant(first)

      const { x, y } = worldToScreen(first)
      g.position.set(x, y)
      g.width = g.height = cellSize
    },
  )
}
