import { Application, Container, Graphics, ICanvas, Text } from 'pixi.js'
import { zip } from 'rxjs'
import { position$, viewport$, zoom$ } from './game-state.js'

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
  const container = new Container()
  app.stage.addChild(container)

  let lines: Graphics | null = null

  const cellSize = 40

  zip(viewport$, zoom$).subscribe(([viewport, zoom]) => {
    console.log('updating lines')

    if (lines) {
      container.removeChild(lines)
      lines.destroy()
    }

    lines = new Graphics()
    container.addChild(lines)
    lines.lineStyle(2, 'hsl(0, 0%, 10%)')

    const rows = Math.ceil(viewport.y / cellSize) + 1
    const cols = Math.ceil(viewport.x / cellSize) + 1

    for (let x = 0; x < cols; x++) {
      lines.moveTo(x * cellSize, 0).lineTo(x * cellSize, cellSize * rows)
    }

    for (let y = 0; y < rows; y++) {
      lines.moveTo(0, y * cellSize).lineTo(cellSize * cols, y * cellSize)
    }
  })

  position$.subscribe((position) => {
    container.position.set(
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
  const container = new Container()
  app.stage.addChild(container)

  let lines = new Graphics()
  container.addChild(lines)

  lines.lineStyle(2, 'hsl(0, 0%, 30%)')
  const cellSize = 40
  const chunkSize = 10

  const rows = Math.ceil(rect.height / cellSize / chunkSize) + 1
  const cols = Math.ceil(rect.width / cellSize / chunkSize) + 1

  for (let x = 0; x < cols; x++) {
    lines
      .moveTo(x * cellSize * chunkSize, 0)
      .lineTo(x * cellSize * chunkSize, cellSize * chunkSize * rows)
  }

  for (let y = 0; y < rows; y++) {
    lines
      .moveTo(0, y * cellSize * chunkSize)
      .lineTo(cellSize * chunkSize * cols, y * cellSize * chunkSize)
  }

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

  position$.subscribe((position) => {
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
