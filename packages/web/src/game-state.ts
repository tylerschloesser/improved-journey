import { clamp, isEqual } from 'lodash-es'
import { Container } from 'pixi.js'
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  skip,
  Subject,
  take,
  withLatestFrom,
} from 'rxjs'
import invariant from 'tiny-invariant'
import { animateVec2 } from './animate.js'
import { BuildEntity, Entity, EntityId, EntityType } from './entity-types.js'
import { generateWorld } from './generate-world.js'
import { Cell, CellId, World } from './types.js'
import {
  cellIndexToPosition,
  CHUNK_SIZE,
  fixWorld,
  intersects,
  setEntityId,
  setNodes,
  toCellId,
} from './util.js'
import { Vec2 } from './vec2.js'
import { worker } from './worker.js'

export const build$ = new BehaviorSubject<null | {
  entity: BuildEntity
  valid: boolean
}>(null)

export const viewport$ = new Subject<Vec2>()
export const zoom$ = new BehaviorSubject<number>(0.5)

export const position$ = new BehaviorSubject(new Vec2(0, 0))

export const move$ = new Subject<Vec2>()
export const wheel$ = new Subject<{ deltaY: number; position: Vec2 }>()
export const tap$ = new Subject<Vec2>()

export const world$ = new BehaviorSubject<World>(generateWorld())

fromEvent<MessageEvent<{ world: World }>>(worker, 'message').subscribe(
  (message) => {
    fixWorld(message.data.world)
    world$.next(message.data.world)
  },
)

function getNodes(entity: Omit<Entity, 'id'>) {
  const { size } = entity
  const nodes: Vec2[] = []
  for (let x = 0; x < size.x; x++) {
    nodes.push(new Vec2(x, -1))
    nodes.push(new Vec2(x, size.y))
  }
  for (let y = 0; y < size.y; y++) {
    nodes.push(new Vec2(-1, y))
    nodes.push(new Vec2(size.x, y))
  }
  return nodes.map((v) => entity.position.add(v))
}

export function addEntities(world: World, entities: BuildEntity[]): void {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]

    const entityId = `${world.nextEntityId++}`
    invariant(world.entities[entityId] === undefined)

    if (entity.type === EntityType.Belt) {
      let { prev, next } = entity
      if (!prev) {
        prev = `${world.nextEntityId - 2}`
      }
      if (!next) {
        next = `${world.nextEntityId}`
      }

      invariant(prev)
      invariant(next)

      world.entities[entityId] = {
        ...entity,
        id: entityId,
        prev,
        next,
      }
    } else {
      world.entities[entityId] = {
        id: entityId,
        ...entity,
      }
    }

    for (let x = 0; x < entity.size.x; x++) {
      for (let y = 0; y < entity.size.y; y++) {
        setEntityId({
          position: entity.position.add(new Vec2(x, y)),
          entityId,
          chunks: world.chunks,
        })
      }
    }

    if ([EntityType.Miner, EntityType.Generator].includes(entity.type)) {
      const nodes = getNodes(entity)
      setNodes({ nodes, entityId, chunks: world.chunks })
    }
  }
}

export const entities$ = world$.pipe(map((world) => world.entities))

export const chunks$ = world$.pipe(
  map((world) => world.chunks),
  distinctUntilChanged<World['chunks']>(isEqual),
)

export const cells$ = chunks$.pipe(
  map((chunks) => {
    const cells = new Map<CellId, Cell>()

    for (const chunk of Object.values(chunks)) {
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

move$.pipe(withLatestFrom(cellSize$)).subscribe(([move, cellSize]) => {
  position$.next(position$.value.add(move.div(cellSize).mul(-1)))
})

export const pinch$ = new Subject<{
  center: Vec2
  drag: Vec2
  zoom: number
}>()

// TODO this is roughly the same as wheel$ below
pinch$.pipe(withLatestFrom(viewport$)).subscribe(([pinch, viewport]) => {
  const zoom = {
    prev: zoom$.value,
    next: clamp(zoom$.value + pinch.zoom / 1_000, 0, 1),
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

  position$.next(position$.value.add(adjust))
  zoom$.next(zoom.next)
})

// TODO this is roughly the same as pinch$ above
wheel$
  .pipe(withLatestFrom(viewport$))
  .subscribe(([{ deltaY, position }, viewport]) => {
    const zoom = zoom$.value

    const nextZoom = clamp(zoom + (deltaY / 4_000) * -1, 0, 1)

    if (zoom === nextZoom) return

    const anchor = position.sub(viewport.div(2))
    const adjust = anchor
      .div(zoomToCellSize(zoom))
      .sub(anchor.div(zoomToCellSize(nextZoom)))

    position$.next(position$.value.add(adjust))

    zoom$.next(nextZoom)
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
      const a2 = entity.position
      const b2 = entity.position.add(entity.size)

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

connection$.subscribe((connection) => {
  if (connection) {
    focus$.next({
      entityId: connection.entityId,
      mode: FocusMode.Connection,
    })
  }
})

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

  let center = entity.position.add(entity.size.div(2))

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

dampen$.pipe(withLatestFrom(cellSize$)).subscribe(([{ v }, cellSize]) => {
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
      position$.next(position$.value.add(next.mul(elapsed)))
    },
  })
})
