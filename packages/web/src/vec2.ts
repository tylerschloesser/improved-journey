import invariant from 'tiny-invariant'

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

export type SimpleVec2 = [number, number]

export class Vec2 {
  readonly __type = 'Vec2'
  readonly x: number
  readonly y: number

  constructor(x: number | SimpleVec2 = 0, y?: number) {
    if (typeof x === 'number') {
      this.x = x
      this.y = y ?? x
    } else {
      this.x = x[0]
      this.y = x[1]
    }
    invariant(!Number.isNaN(this.x))
    invariant(!Number.isNaN(this.y))
  }

  sub(v: Vec2 | number): Vec2 {
    if (typeof v === 'number') {
      return new Vec2(this.x - v, this.y - v)
    }
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  add(v: Vec2 | number): Vec2 {
    if (typeof v === 'number') {
      return new Vec2(this.x + v, this.y + v)
    }
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  mul(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s)
  }

  div(s: number): Vec2 {
    invariant(s !== 0)
    return new Vec2(this.x / s, this.y / s)
  }

  len(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  norm(): Vec2 {
    const l = this.len()
    if (l === 0) {
      return new Vec2(0)
    }
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

  floor(): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y))
  }

  toSimple(): SimpleVec2 {
    return [this.x, this.y]
  }
}
