import { Application, ICanvas } from 'pixi.js'
import { initGame } from './init-game.js'
import { initGrid } from './init-grid.js'
import { initInput } from './input.js'

interface InitArgs {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  app: Application<ICanvas>
}

function initCursor({ app }: InitArgs) {}

export function init(args: InitArgs): void {
  initInput(args)
  initGrid(args)
  initGame(args)
  initCursor(args)
}
