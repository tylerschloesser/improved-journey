import { clamp } from 'lodash-es'
import {
  BehaviorSubject,
  combineLatest,
  map,
  Subject,
  withLatestFrom,
} from 'rxjs'
import { Vec2 } from './vec2.js'

export interface GameState {
  position$: BehaviorSubject<Vec2>
  surfaces: {
    main: Subject<Surface>
    build: Subject<Surface>
  }
}

export const build$ = new BehaviorSubject<null | {
  position: Vec2
}>(null)

export const viewport$ = new Subject<Vec2>()
export const zoom$ = new BehaviorSubject<number>(0.5)

export const position$ = new BehaviorSubject(new Vec2(0, 0))

export const move$ = new Subject<Vec2>()
export const wheel$ = new Subject<{ deltaY: number; position: Vec2 }>()

export const cursor$ = new BehaviorSubject<{ enabled: boolean }>({
  enabled: false,
})

export const entities$ = new BehaviorSubject<Record<EntityId, Entity>>({
  miner1: {
    id: 'miner1',
    position: new Vec2(1, 2),
    size: new Vec2(2, 2),
  },
})

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

export const translate$ = combineLatest([position$, viewport$, cellSize$]).pipe(
  map(([position, viewport, cellSize]) => {
    return (world: Vec2) => {
      return world.sub(position).mul(cellSize).add(viewport.div(2))
    }
  }),
)
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

interface Entity {
  id: EntityId
  position: Vec2
  size: Vec2
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
