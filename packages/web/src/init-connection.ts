import { isEqual } from 'lodash-es'
import { Container, Graphics } from 'pixi.js'
import {
  combineLatest,
  distinctUntilChanged,
  map,
  scan,
  shareReplay,
} from 'rxjs'
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

const CONNECTION_POINT_RADIUS = 0.166
const SCALE = 10

export function initConnection({ app }: InitArgs) {
  const entity$ = combineLatest([connection$, entities$]).pipe(
    map(([connection, entities]) =>
      connection ? entities[connection.entityId] : null,
    ),
    distinctUntilChanged<Entity | null>(isEqual),
  )

  interface Config {
    entity: Entity
    center: Vec2
    points: Vec2[]
  }

  const config$ = entity$.pipe(
    map<Entity | null, Config | null>((entity) => {
      if (entity === null) return null

      const center = entity.position.add(entity.size.div(2))
      const points: Vec2[] = []

      for (const node of entity.nodes) {
        points.push(node.position.sub(entity.size.div(2).floor()))
      }

      return {
        entity,
        center,
        points,
      }
    }),
  )

  interface State {
    container: Container
    g: {
      points: Graphics
      selected: Graphics
    }
    config: Config
  }

  const state$ = config$.pipe(
    distinctUntilChanged<Config | null>(isEqual),
    scan<Config | null, State | null>((state, config) => {
      if (state !== null) {
        app.stage.removeChild(state.container)
        state.container.destroy({ children: true })
      }

      if (config === null) {
        return null
      }

      const container = new Container()
      app.stage.addChild(container)

      const g: State['g'] = {
        points: new Graphics(),
        selected: new Graphics(),
      }

      container.addChild(g.points)
      {
        const r = CONNECTION_POINT_RADIUS * SCALE
        for (const { x, y } of config.points) {
          g.points.beginFill('hsl(0, 0%, 20%)')
          g.points.drawCircle((x + 0.5) * SCALE, (y + 0.5) * SCALE, r)
          g.points.endFill()

          const width = SCALE * 0.05
          g.points.lineStyle(width, 'hsl(0, 0%, 20%)')
          g.points.drawRect(
            x * SCALE + width / 2,
            y * SCALE + width / 2,
            SCALE - width,
            SCALE - width,
          )
        }
      }

      container.addChild(g.selected)
      {
        const width = SCALE * 0.05
        g.selected.lineStyle(width, 'green')
        g.selected.drawRect(width / 2, width / 2, SCALE - width, SCALE - width)

        const r = CONNECTION_POINT_RADIUS * SCALE
        g.selected.lineStyle(0)
        g.selected.beginFill('green')
        g.selected.drawCircle(0.5 * SCALE, 0.5 * SCALE, r)
      }

      return { container, entity: config.entity, g, config }
    }, null),
    shareReplay(),
  )

  const selected$ = combineLatest([config$, position$]).pipe(
    map(([config, position]) => {
      if (config === null) return null

      let closest: { point: Vec2; dist: number } | null = null
      for (const point of config.points) {
        const dist = position
          .sub(config.center.add(point.add(new Vec2(0.5))))
          .len()
        if (closest === null || dist < closest.dist) {
          closest = { point, dist }
        }
      }
      invariant(closest)
      return closest.point
    }),
    distinctUntilChanged<Vec2 | null>(isEqual),
  )

  combineLatest([state$, selected$]).subscribe(([state, selected]) => {
    if (!state || !selected) return

    const { x, y } = selected.mul(SCALE)
    state.g.selected.position.set(x, y)
  })

  combineLatest([state$, worldToScreen$, cellSize$]).subscribe(
    ([state, worldToScreen, cellSize]) => {
      if (state === null) {
        return
      }

      const { config, container } = state

      const { x, y } = worldToScreen(config.center)
      container.position.set(x, y)

      const size = config.entity.size.add(2).mul(cellSize)
      container.width = size.x
      container.height = size.y
    },
  )
}
