import { InitArgs } from './init-args.js'
import { initInput } from './input.js'

// function initCursor({ app }: InitArgs) {
//   const circle = new Graphics()
//   circle.zIndex = ZIndex.Cursor
//   circle.visible = false
//
//   circle.beginFill('hsla(0, 100%, 100%, .5)')
//   circle.drawCircle(0, 0, 100)
//
//   app.stage.addChild(circle)
//
//   combineLatest([viewport$, cellSize$, cursor$]).subscribe(
//     ([viewport, cellSize, cursor]) => {
//       if (cursor.enabled === false) {
//         circle.visible = false
//         return
//       }
//
//       const { x, y } = viewport.div(2)
//
//       circle.width = circle.height = cellSize / 2
//       circle.position.set(x, y)
//       circle.visible = true
//     },
//   )
// }

// function initPixi({ app }: InitArgs): void {
//   app.stage.addChild(PIXI.container.world)
//
//   const container = PIXI.container.world
//   container.zIndex = 1
//
//   combineLatest([position$, cellSize$, viewport$]).subscribe(
//     ([position, cellSize, viewport]) => {
//       const { x, y } = position.mul(cellSize * -1).add(viewport.div(2))
//       container.position.set(x, y)
//       container.scale.set(cellSize)
//     },
//   )
// }

export function init(args: InitArgs): void {
  // initPixi(args)
  initInput(args)
  // initGrid(args)
  // initGame(args)
  // initCursor(args)
  // initBuild(args)
  // initConnection(args)
}
