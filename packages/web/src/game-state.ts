import { clamp, cloneDeep, isEqual } from 'lodash-es'
import { Container } from 'pixi.js'
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  ReplaySubject,
  skip,
  Subject,
  take,
  withLatestFrom,
} from 'rxjs'
import invariant from 'tiny-invariant'
import { addEntities } from './add-entities.js'
import { animateVec2 } from './animate.js'
import { TARGET_OPTIONS } from './const.js'
import { BuildEntity, Entity, EntityId, EntityType } from './entity-types.js'
import { ItemType } from './item-types.js'
import { saveClient } from './storage.js'
import { Cell, CellId, Chunk, Client, TickResponse, World } from './types.js'
import {
  cellIndexToPosition,
  CHUNK_SIZE,
  intersects,
  toCellId,
} from './util.js'
import { Vec2 } from './vec2.js'
import { worker } from './worker.js'

export const build$ = new BehaviorSubject<null | {
  entity: BuildEntity
  valid: boolean
}>(null)

export const worldSize$ = new BehaviorSubject<number>(-1)

export const satisfaction$ = new BehaviorSubject<number>(0)
export const viewport$ = new Subject<Vec2>()

export const zoom$ = new ReplaySubject<number>(1)

export enum ZoomLevel {
  High,
  Medium,
  Low,
}

export const zoomLevel$ = zoom$.pipe(
  map((zoom) => {
    if (zoom >= 0.8) {
      return ZoomLevel.High
    }
    if (zoom < 0.2) {
      return ZoomLevel.Low
    }
    return ZoomLevel.Medium
  }),
  distinctUntilChanged(),
)

export const position$ = new ReplaySubject<Vec2>(1)

export const move$ = new Subject<Vec2>()
export const wheel$ = new Subject<{ deltaY: number; position: Vec2 }>()
export const tap$ = new Subject<Vec2>()

export const world$ = new ReplaySubject<World>(1)

export const newEntities$ = new Subject<Entity[]>()
export const addEntities$ = new Subject<BuildEntity[]>()

addEntities$.pipe(withLatestFrom(world$)).subscribe(([builds, world]) => {
  world = cloneDeep(world)
  const entities = addEntities(world, builds)
  world$.next(world)

  newEntities$.next(entities)
})

export const setTarget$ = new Subject<{
  entityId: EntityId
  target: ItemType
}>()

setTarget$
  .pipe(withLatestFrom(world$))
  .subscribe(([{ entityId, target }, world]) => {
    world = cloneDeep(world)

    const entity = world.entities[entityId]
    invariant(
      entity.type === EntityType.Miner || entity.type === EntityType.Smelter,
    )
    const options = TARGET_OPTIONS[entity.type]
    invariant(options.includes(target))

    entity.target = target

    world$.next(world)
  })

export const tick$ = world$.pipe(map((world) => world.tick))

fromEvent<MessageEvent<TickResponse>>(worker, 'message').subscribe(
  (message) => {
    const { world, satisfaction } = message.data
    satisfaction$.next(satisfaction)
    world$.next(world)
  },
)

export const entities$ = world$.pipe(map((world) => world.entities))

export const chunks$ = world$.pipe(
  map((world) => world.chunks),
  distinctUntilChanged<World['chunks']>(isEqual),
)

export const cells$ = chunks$.pipe(
  map((chunks) => {
    const cells = new Map<CellId, Cell>()

    for (const chunk of Object.values(chunks) as Chunk[]) {
      invariant(chunk.cells.length === CHUNK_SIZE ** 2)

      for (let i = 0; i < chunk.cells.length; i++) {
        const cell = chunk.cells[i]
        if (cell) {
          const cellId = toCellId(cellIndexToPosition(chunk, i))
          cells.set(cellId, cell)
        }
      }
    }

    return cells
  }),
)

export const navigate$ = new Subject<{ to: string }>()

const MAX_CELL_SIZE = 100
const MIN_CELL_SIZE = 10

function zoomToCellSize(zoom: number) {
  return MIN_CELL_SIZE + (MAX_CELL_SIZE - MIN_CELL_SIZE) * zoom
}

export const cellSize$ = zoom$.pipe(map(zoomToCellSize))

move$
  .pipe(withLatestFrom(cellSize$, position$))
  .subscribe(([move, cellSize, position]) => {
    position$.next(position.add(move.div(cellSize).mul(-1)))
  })

export const pinch$ = new Subject<{
  center: Vec2
  drag: Vec2
  zoom: number
}>()

// TODO this is roughly the same as wheel$ below
pinch$
  .pipe(withLatestFrom(viewport$, position$, zoom$))
  .subscribe(([pinch, viewport, position, prevZoom]) => {
    const zoom = {
      prev: prevZoom,
      next: clamp(prevZoom + pinch.zoom / 1_000, 0, 1),
    }

    const scale = {
      prev: zoomToCellSize(zoom.prev),
      next: zoomToCellSize(zoom.next),
    }

    const anchor = pinch.center.sub(viewport.div(2))

    const adjust = anchor
      .div(scale.prev)
      .sub(anchor.div(scale.next))
      .add(pinch.drag.div(scale.next))

    position$.next(position.add(adjust))
    zoom$.next(zoom.next)
  })

// TODO this is roughly the same as pinch$ above
wheel$
  .pipe(withLatestFrom(viewport$, position$, zoom$))
  .subscribe(([wheel, viewport, position, prevZoom]) => {
    const zoom = {
      prev: prevZoom,
      next: clamp(prevZoom + (wheel.deltaY / 4_000) * -1, 0, 1),
    }

    if (zoom.prev === zoom.next) return

    const anchor = wheel.position.sub(viewport.div(2))
    const adjust = anchor
      .div(zoomToCellSize(zoom.prev))
      .sub(anchor.div(zoomToCellSize(zoom.next)))

    position$.next(position.add(adjust))
    zoom$.next(zoom.next)
  })

export const worldToScreen$ = combineLatest([
  position$,
  viewport$,
  cellSize$,
]).pipe(
  map(([position, viewport, cellSize]) => {
    return (world: Vec2 = new Vec2()) => {
      return world.sub(position).mul(cellSize).add(viewport.div(2))
    }
  }),
)

export interface Pixi {
  container: {
    world: Container
  }
}

export const PIXI: Pixi = {
  container: {
    world: new Container(),
  },
}

export const screenToWorld$ = combineLatest([
  position$,
  viewport$,
  cellSize$,
]).pipe(
  map(([position, viewport, cellSize]) => {
    return (screen: Vec2) => {
      return screen.sub(viewport.div(2)).div(cellSize).add(position)
    }
  }),
)

tap$
  .pipe(withLatestFrom(screenToWorld$, entities$))
  .subscribe(([tap, screenToWorld, entities]) => {
    const world = screenToWorld(tap).floor()

    const a1 = world
    const b1 = world.add(new Vec2(1, 1))

    for (const entity of Object.values(entities)) {
      const a2 = new Vec2(entity.position)
      const b2 = new Vec2(entity.position).add(new Vec2(entity.size))

      if (intersects(a1, a2, b1, b2)) {
        navigate$.next({ to: `entity/${entity.id}` })
      }
    }
  })

export enum FocusMode {
  Entity,
  Connection,
}

export const focus$ = new Subject<{ entityId: EntityId; mode: FocusMode }>()

export const connection$ = new BehaviorSubject<null | {
  entityId: EntityId
}>(null)

merge(
  // use combineLatest once so that we handle a focus that may happen
  // before other observables have emitted. e.g. on page load
  combineLatest([focus$, entities$, position$, viewport$, cellSize$]).pipe(
    take(1),
  ),
  // then use withLatestFrom so we this only happens when focus emits.
  // skip the first value because it's handled above
  focus$.pipe(
    withLatestFrom(entities$, position$, viewport$, cellSize$),
    skip(1),
  ),
).subscribe(([{ entityId, mode }, entities, position, viewport, cellSize]) => {
  const entity = entities[entityId]

  let center = new Vec2(entity.position).add(new Vec2(entity.size).div(2))

  if (mode === FocusMode.Entity) {
    // entity UI takes up half the bottom of the screen
    // adjust accordingly
    center = center.add(new Vec2(0, viewport.div(4).div(cellSize).y))
  }

  animateVec2({
    from: position,
    to: center,
    duration: 200,
    callback(v) {
      position$.next(v)
    },
  })
})

export const dampen$ = new Subject<{ v: Vec2 }>()

dampen$
  .pipe(withLatestFrom(cellSize$, position$))
  .subscribe(([{ v }, cellSize, position]) => {
    const duration = 500

    const from = v.mul(-1).div(cellSize)

    // TODO not sure if it makes a noticable difference, but we could
    // animate here, between the last pointer move and the upcoming
    // "dampen" movement

    animateVec2({
      from,
      to: new Vec2(0),
      duration,
      callback(next, elapsed) {
        // FIXME hacky way to store position...
        position = position.add(next.mul(elapsed))
        position$.next(position)
      },
    })
  })

combineLatest([zoom$, position$]).subscribe(([zoom, position]) => {
  const client: Client = { zoom, position: position.toSimple() }
  saveClient(client)
})

export interface Select {
  start: Vec2 | null
  end: Vec2 | null
}

export const select$ = new BehaviorSubject<Select | null>(null)
