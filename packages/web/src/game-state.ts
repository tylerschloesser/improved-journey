import { BehaviorSubject, Subject } from 'rxjs'

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

export class Vec2 {
  readonly x: number
  readonly y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  sub(v: Vec2 | number): Vec2 {
    if (typeof v === 'number') {
      return new Vec2(this.x - v, this.y - v)
    }
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s)
  }

  div(s: number): Vec2 {
    return new Vec2(this.x / s, this.y / s)
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  norm(): Vec2 {
    const l = this.len()
    return new Vec2(this.x / l, this.y / l)
  }

  angle(): number {
    return Math.atan2(this.y, this.x)
  }

  equals(v: Vec2): boolean {
    return this.x === v.x && this.y === v.y
  }

  toString(fractionDigits: number = 0) {
    const x = this.x.toFixed(fractionDigits)
    const y = this.y.toFixed(fractionDigits)
    return `[${x},${y}]`
  }

  mod(v: number) {
    return new Vec2(mod(this.x, v), mod(this.y, v))
  }
}

export interface GameState {
  position$: BehaviorSubject<Vec2>
  surfaces: {
    main: Subject<Surface>
    build: Subject<Surface>
  }
}

export const viewport$ = new Subject<Vec2>()
export const zoom$ = new BehaviorSubject<number>(0)

export const position$ = new BehaviorSubject(new Vec2(0, 0))

export const move$ = new Subject<Vec2>()

move$.subscribe((move) => {
  position$.next(position$.value.add(move))
})

export interface RenderState {
  viewport: Vec2
  zoom: number
  position: Vec2
}

type EntityId = string
type SurfaceId = string
type ChunkId = string

interface Chunk {
  id: ChunkId
  tiles: (EntityId | null)[]
}

type Entity = unknown

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
