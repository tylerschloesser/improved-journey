import { Application, Container, Graphics, ICanvas, Text } from 'pixi.js'
import { gameState } from './game-state.js'

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function initCellGrid({
  app,
  rect,
}: {
  app: Application<ICanvas>
  rect: DOMRect
}) {
  let obj = new Graphics()

  obj.lineStyle(2, 'hsl(0, 0%, 10%)')

  const cellSize = 40

  const rows = Math.ceil(rect.height / cellSize) + 1
  const cols = Math.ceil(rect.width / cellSize) + 1

  for (let x = 0; x < cols; x++) {
    obj.moveTo(x * cellSize, 0).lineTo(x * cellSize, cellSize * rows)
  }

  for (let y = 0; y < rows; y++) {
    obj.moveTo(0, y * cellSize).lineTo(cellSize * cols, y * cellSize)
  }

  app.stage.addChild(obj)

  gameState.position$.subscribe((position) => {
    obj.position.set(
      mod(position.x, cellSize) - cellSize,
      mod(position.y, cellSize) - cellSize,
    )
  })
}

function initChunkGrid({
  app,
  rect,
}: {
  app: Application<ICanvas>
  rect: DOMRect
}) {
  let obj = new Graphics()

  obj.lineStyle(2, 'hsl(0, 0%, 30%)')
  const cellSize = 40
  const chunkSize = 10

  const rows = Math.ceil(rect.height / cellSize / chunkSize) + 1
  const cols = Math.ceil(rect.width / cellSize / chunkSize) + 1

  for (let x = 0; x < cols; x++) {
    obj
      .moveTo(x * cellSize * chunkSize, 0)
      .lineTo(x * cellSize * chunkSize, cellSize * chunkSize * rows)
  }

  for (let y = 0; y < rows; y++) {
    obj
      .moveTo(0, y * cellSize * chunkSize)
      .lineTo(cellSize * chunkSize * cols, y * cellSize * chunkSize)
  }

  app.stage.addChild(obj)

  const container = new Container()
  app.stage.addChild(container)

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const text = new Text(`[${x},${y}]`, {
        fontFamily: 'monospace',
        fill: 'hsl(0, 0%, 30%)',
      })
      text.x = x * cellSize * chunkSize
      text.y = y * cellSize * chunkSize

      container.addChild(text)
    }
  }

  gameState.position$.subscribe((position) => {
    obj.position.set(
      mod(position.x, cellSize * chunkSize) - cellSize * chunkSize,
      mod(position.y, cellSize * chunkSize) - cellSize * chunkSize,
    )

    container.position.set(
      mod(position.x, cellSize * chunkSize) - cellSize * chunkSize,
      mod(position.y, cellSize * chunkSize) - cellSize * chunkSize,
    )
  })
}

export function initGrid({
  app,
  rect,
}: {
  app: Application<ICanvas>
  rect: DOMRect
}) {
  initCellGrid({ app, rect })
  initChunkGrid({ app, rect })
}
