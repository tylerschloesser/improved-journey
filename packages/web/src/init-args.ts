import { Application, ICanvas } from 'pixi.js'

export interface InitArgs {
  canvas: HTMLCanvasElement
  signal: AbortSignal
  app: Application<ICanvas>
}
