import { isEqual } from 'lodash-es'
import { Container, Graphics } from 'pixi.js'
import { combineLatest, distinctUntilChanged, map, scan } from 'rxjs'
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

const CONNECTION_POINT_RADIUS = 0.25

export function initConnection({ app }: InitArgs) {
  // let container: Container | null = null

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

      for (let x = 0; x < entity.size.x; x++) {
        points.push(new Vec2(1 + x, 0))
        points.push(new Vec2(1 + x, entity.size.y + 1))
      }

      for (let y = 0; y < entity.size.y; y++) {
        points.push(new Vec2(0, 1 + y))
        points.push(new Vec2(entity.size.x + 1, 1 + y))
      }

      return {
        entity,
        center,
        points: points.map((point) =>
          point.sub(entity.size.div(2).add(new Vec2(1, 1))),
        ),
      }
    }),
  )

  interface State {
    container: Container
    g: {
      points: Graphics
    }
    entity: Entity
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
      }

      {
        container.addChild(g.points)
        const scale = 10
        const r = CONNECTION_POINT_RADIUS * scale
        g.points.beginFill('hsl(0, 0%, 50%)')
        for (const { x, y } of config.points) {
          g.points.drawCircle((x + 0.5) * scale, (y + 0.5) * scale, r)
        }
      }

      return { container, entity: config.entity, g, config }
    }, null),
  )

  const selected$ = combineLatest([config$, position$]).pipe(
    map(([config, position]) => {
      if (config === null) return null

      let closest: { point: Vec2; dist: number } | null = null
      for (const point of config.points) {
        const dist = position.sub(config.center.add(point)).len()
        if (closest === null || dist < closest.dist) {
          closest = { point, dist }
        }
      }
      invariant(closest)
      return closest.point
    }),
    distinctUntilChanged(isEqual),
  )

  selected$.subscribe((point) => {
    console.log('closest', point)
  })

  combineLatest([state$, worldToScreen$, cellSize$]).subscribe(
    ([state, worldToScreen, cellSize]) => {
      if (state === null) {
        return
      }

      const { config, container } = state

      const { x, y } = worldToScreen(config.center)
      container.position.set(x, y)

      const r = CONNECTION_POINT_RADIUS
      const size = config.entity.size.add(1 + r * 2).mul(cellSize)

      container.width = size.x
      container.height = size.y
    },
  )
}
