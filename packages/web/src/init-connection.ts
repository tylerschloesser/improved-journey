import { combineLatest, distinctUntilChanged, map } from 'rxjs'
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
import { isEqual } from 'lodash-es'

export function initConnection({ app }: InitArgs) {
  let container: Container | null = null
  // let g: Graphics | null = null

  const entity$ = combineLatest([connection$, entities$]).pipe(
    map(([connection, entities]) =>
      connection ? entities[connection.entityId] : null,
    ),
    distinctUntilChanged(isEqual),
  )

  const config$ = entity$.pipe(
    map((entity) => {
      if (entity === null) {
        if (container) {
          app.stage.removeChild(container)
          container.destroy({ children: true })
          container = null
        }
        return null
      }

      const config = {
        position: entity.position.sub(new Vec2(1, 1)),
        size: entity.size.add(new Vec2(2, 2)),
      }

      if (container === null) {
        container = new Container()
        container.zIndex = ZIndex.Connection
        app.stage.addChild(container)

        const points: Vec2[] = []
        for (let x = 0; x < entity.size.x; x++) {
          points.push(new Vec2(1 + x, 0))
          points.push(new Vec2(1 + x, entity.size.y + 1))
        }
        for (let y = 0; y < entity.size.y; y++) {
          points.push(new Vec2(0, 1 + y))
          points.push(new Vec2(entity.size.x + 1, 1 + y))
        }

        const g = new Graphics()
        const width = 0.05
        g.lineStyle(width, `hsl(0, 0%, 50%)`)

        for (const { x, y } of points) {
          g.drawRect(x + width / 2, y + width / 2, 1 - width, 1 - width)
          container.addChild(g)
        }
      }

      return config
    }),
  )

  combineLatest([config$, worldToScreen$, cellSize$]).subscribe(
    ([config, worldToScreen, cellSize]) => {
      if (container === null || config === null) {
        return
      }

      const { x, y } = worldToScreen(config.position)
      container.position.set(x, y)
      container.width = config.size.x * cellSize
      container.height = config.size.y * cellSize
    },
  )
}
