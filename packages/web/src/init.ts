import { Application, ICanvas } from 'pixi.js'
import { initGame } from './init-game.js'
import { initGrid } from './init-grid.js'
import { initInput } from './input.js'

export function init({
  canvas,
  signal,
  app,
}: {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  app: Application<ICanvas>
}): void {
  initInput({ canvas, signal })
  initGrid({ app })
  initGame({ app })
}
