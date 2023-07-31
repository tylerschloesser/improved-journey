import { isEqual } from 'lodash-es'
import { Container, Graphics } from 'pixi.js'
import { combineLatest, distinctUntilChanged, filter, map, scan } from 'rxjs'
import invariant from 'tiny-invariant'
import {
  cellSize$,
  connection$,
  entities$,
  Entity,
  position$,
  worldToScreen$,
} from './game-state.js'
import { InitArgs } from './init-args.js'
import { Vec2 } from './vec2.js'
import { ZIndex } from './z-index.js'

export function initConnection({ app }: InitArgs) {
  let container: Container | null = null

  const entity$ = combineLatest([connection$, entities$]).pipe(
    map(([connection, entities]) =>
      connection ? entities[connection.entityId] : null,
    ),
    distinctUntilChanged<Entity | null>(isEqual),
  )

  const config$ = entity$.pipe(
    map((entity) => {
      if (entity === null) return null

      const cells: Vec2[] = []
      for (let x = 0; x < entity.size.x; x++) {
        cells.push(new Vec2(1 + x, 0))
        cells.push(new Vec2(1 + x, entity.size.y + 1))
      }
      for (let y = 0; y < entity.size.y; y++) {
        cells.push(new Vec2(0, 1 + y))
        cells.push(new Vec2(entity.size.x + 1, 1 + y))
      }

      return {
        cells,
        bb: {
          position: entity.position.sub(new Vec2(1, 1)),
          size: entity.size.add(new Vec2(2, 2)),
        },
      }
    }),
  )

  interface State {
    container: Container
    entity: Entity
  }

  const state$ = entity$.pipe(
    distinctUntilChanged<Entity | null>(isEqual),
    scan<Entity | null, State | null>((state, entity) => {
      if (state !== null) {
        app.stage.removeChild(state.container)
        state.container.destroy({ children: true })
      }

      if (entity === null) {
        return null
      }

      const container = new Container()
      app.stage.addChild(container)

      return { container, entity }
    }, null),
    filter((state) => state !== null),
    map((state) => state as State),
  )

  const selected$ = combineLatest([config$, position$]).pipe(
    map(([config, position]) => {
      if (config === null) return null

      let closest: { cell: Vec2; dist: number } | null = null
      for (const cell of config.cells) {
        const dist = position
          .sub(config.bb.position.add(cell).add(new Vec2(0.5, 0.5)))
          .len()
        if (closest === null || dist < closest.dist) {
          closest = { cell, dist }
        }
      }
      invariant(closest)
      return closest.cell
    }),
    distinctUntilChanged(isEqual),
  )

  selected$.subscribe((cell) => {
    console.log('closest', cell)
  })

  config$.subscribe((config) => {
    if (config === null) {
      if (container) {
        app.stage.removeChild(container)
        container.destroy({ children: true })
        container = null
      }
      return
    }

    const { cells, bb } = config

    if (container === null) {
      container = new Container()
      container.zIndex = ZIndex.Connection
      app.stage.addChild(container)

      const g = new Graphics()
      container.addChild(g)

      const scale = 10

      // TODO fix this is dumb as fuck
      // force the container to have a size that makes positioning easier
      // but transparent doesn't work...
      g.beginFill('hsla(0, 100%, 50%, .0001)')
      g.drawRect(0, 0, bb.size.x * scale, bb.size.y * scale)

      const r = 0.25 * scale
      g.beginFill('hsl(0, 0%, 50%)')

      for (const { x, y } of cells.slice(0, 8)) {
        g.drawCircle((x + 0.5) * scale, (y + 0.5) * scale, r)
      }
    }
  })

  combineLatest([config$, worldToScreen$, cellSize$]).subscribe(
    ([config, worldToScreen, cellSize]) => {
      if (container === null || config === null) {
        return
      }

      const { x, y } = worldToScreen(config.bb.position)
      container.position.set(x, y)
      container.width = config.bb.size.x * cellSize
      container.height = config.bb.size.y * cellSize
    },
  )
}
