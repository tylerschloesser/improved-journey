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
  EntityNode,
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

  interface State {
    container: Container
    g: {
      points: Graphics
      selected: Graphics
    }
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

      const g: State['g'] = {
        points: new Graphics(),
        selected: new Graphics(),
      }

      container.addChild(g.points)
      {
        const r = CONNECTION_POINT_RADIUS * SCALE
        for (const node of entity.nodes) {
          const { x, y } = node.position

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

      return { container, entity, g }
    }, null),
    shareReplay(),
  )

  const selected$ = combineLatest([entity$, position$]).pipe(
    map(([entity, position]) => {
      if (entity === null) return null

      let closest: { node: EntityNode; dist: number } | null = null
      for (const node of entity.nodes) {
        const dist = position
          .sub(entity.position.add(node.position).add(new Vec2(0.5)))
          .len()

        if (closest === null || dist < closest.dist) {
          closest = { node, dist }
        }
      }
      invariant(closest)
      return closest.node
    }),
    distinctUntilChanged<EntityNode | null>(isEqual),
  )

  combineLatest([state$, selected$]).subscribe(([state, selected]) => {
    if (!state || !selected) return

    const { x, y } = selected.position.mul(SCALE)
    state.g.selected.position.set(x, y)
  })

  combineLatest([state$, worldToScreen$, cellSize$]).subscribe(
    ([state, worldToScreen, cellSize]) => {
      if (state === null) {
        return
      }

      const { entity, container } = state

      const { x, y } = worldToScreen(entity.position)
      container.position.set(x, y)

      const size = entity.size.add(2).mul(cellSize)
      container.width = size.x
      container.height = size.y
    },
  )
}
