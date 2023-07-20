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

  toString() {
    return `[${this.x.toFixed(0)},${this.y.toFixed(0)}]`
  }
}

export interface GameState {
  position: Vec2
}

export let gameState: GameState = {
  position: new Vec2(0, 0),
}
