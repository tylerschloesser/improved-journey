import { clamp } from 'lodash-es'
import { Container } from 'pixi.js'
import {
  BehaviorSubject,
  combineLatest,
  map,
  merge,
  skip,
  Subject,
  take,
  withLatestFrom,
} from 'rxjs'
import { animateVec2 } from './animate.js'
import { newMiner } from './miner.js'
import { intersects, toCellId } from './util.js'
import { Vec2 } from './vec2.js'

export interface GameState {
  position$: BehaviorSubject<Vec2>
  surfaces: {
    main: Subject<Surface>
    build: Subject<Surface>
  }
}

export const build$ = new BehaviorSubject<null | {
  entity: Entity
  valid: boolean
}>(null)

export const viewport$ = new Subject<Vec2>()
export const zoom$ = new BehaviorSubject<number>(0.5)

export const position$ = new BehaviorSubject(new Vec2(0, 0))

export const move$ = new Subject<Vec2>()
export const wheel$ = new Subject<{ deltaY: number; position: Vec2 }>()
export const tap$ = new Subject<Vec2>()

export const cursor$ = new BehaviorSubject<{ enabled: boolean }>({
  enabled: false,
})

export const entities$ = new BehaviorSubject<Record<EntityId, Entity>>({
  miner1: newMiner({
    id: 'miner1',
    position: new Vec2(1, 2),
    size: new Vec2(2, 2),
    color: 'blue',
  }),
})

export type CellId = string

export const occupiedCellIds$ = entities$.pipe(
  map((entities) => {
    const occupiedCellIds = new Set<CellId>()

    for (const entity of Object.values(entities)) {
      for (let x = 0; x < entity.size.x; x++) {
        for (let y = 0; y < entity.size.y; y++) {
          const position = entity.position.add(new Vec2(x, y))
          occupiedCellIds.add(toCellId(position))
        }
      }
    }

    return occupiedCellIds
  }),
)

export const navigate$ = new Subject<{ to: string }>()

export const nextEntityId$ = new BehaviorSubject<number>(0)

const MAX_CELL_SIZE = 100
const MIN_CELL_SIZE = 10

function zoomToCellSize(zoom: number) {
  return MIN_CELL_SIZE + (MAX_CELL_SIZE - MIN_CELL_SIZE) * zoom
}

export const cellSize$ = zoom$.pipe(map(zoomToCellSize))

move$.pipe(withLatestFrom(cellSize$)).subscribe(([move, cellSize]) => {
  position$.next(position$.value.add(move.div(cellSize).mul(-1)))
})

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

export const connectionValid$ = new BehaviorSubject<null | boolean>(null)

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

export interface RenderState {
  viewport: Vec2
  zoom: number
  position: Vec2
}

export type EntityId = string
export type SurfaceId = string
export type ChunkId = string

interface Chunk {
  id: ChunkId
  tiles: (EntityId | null)[]
}

export interface EntityNode {
  position: Vec2
}

export interface Entity {
  id: EntityId
  position: Vec2
  size: Vec2
  color: string
  nodes: EntityNode[]
}

interface Surface {
  id: SurfaceId
  chunks: Map<ChunkId, Chunk>
  entities: Map<EntityId, Entity>
}

export let gameState: GameState = {
  position$: new BehaviorSubject<Vec2>(new Vec2(0, 0)),
  surfaces: {
    main: new Subject<Surface>(),
    build: new Subject<Surface>(),
  },
}

export const renderState$ = new Subject<RenderState>()
