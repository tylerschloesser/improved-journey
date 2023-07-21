export class Vec2 {
  readonly x: number
  readonly y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  sub(v: Vec2): Vec2 {
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

  toString(fractionDigits: number = 0) {
    const x = this.x.toFixed(fractionDigits)
    const y = this.y.toFixed(fractionDigits)
    return `[${x},${y}]`
  }
}

export interface GameState {
  position: Vec2
}

export let gameState: GameState = {
  position: new Vec2(0, 0),
}
