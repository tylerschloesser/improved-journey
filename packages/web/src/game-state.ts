export class Vec2 {
  readonly x: number
  readonly y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

export interface GameState {
  position: Vec2
}

export let gameState: GameState = {
  position: new Vec2(0, 0),
}
