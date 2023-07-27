import { Application, Container, Graphics, ICanvas } from 'pixi.js'
import { combineLatest, map } from 'rxjs'
import { position$, viewport$, zoom$ } from './game-state.js'

const MAX_CELL_SIZE = 100
const MIN_CELL_SIZE = 10

const cellSize$ = zoom$.pipe(
  map((zoom) => {
    return MIN_CELL_SIZE + (MAX_CELL_SIZE - MIN_CELL_SIZE) * zoom
  }),
)

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function initCellGrid({ app }: { app: Application<ICanvas> }) {
  const container = new Container()
  app.stage.addChild(container)

  let lines: Graphics | null = null

  combineLatest([viewport$, cellSize$]).subscribe(([viewport, cellSize]) => {
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

  combineLatest([position$, cellSize$]).subscribe(([position, cellSize]) => {
    container.position.set(
      mod(position.x, cellSize) - cellSize,
      mod(position.y, cellSize) - cellSize,
    )
  })
}

function initChunkGrid({ app }: { app: Application<ICanvas> }) {
  const container = new Container()
  app.stage.addChild(container)

  let lines: Graphics | null = null
  const chunkSize = 10

  combineLatest([viewport$, cellSize$]).subscribe(([viewport, cellSize]) => {
    if (lines) {
      container.removeChild(lines)
      lines.destroy()
    }

    lines = new Graphics()
    container.addChild(lines)

    lines.lineStyle(2, 'hsl(0, 0%, 30%)')

    const rows = Math.ceil(viewport.y / cellSize / chunkSize) + 1
    const cols = Math.ceil(viewport.x / cellSize / chunkSize) + 1

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
  })

  // for (let x = 0; x < cols; x++) {
  //   for (let y = 0; y < rows; y++) {
  //     const text = new Text(`[${x},${y}]`, {
  //       fontFamily: 'monospace',
  //       fill: 'hsl(0, 0%, 30%)',
  //     })
  //     text.x = x * cellSize * chunkSize
  //     text.y = y * cellSize * chunkSize

  //     container.addChild(text)
  //   }
  // }

  combineLatest([position$, cellSize$]).subscribe(([position, cellSize]) => {
    container.position.set(
      mod(position.x, cellSize * chunkSize) - cellSize * chunkSize,
      mod(position.y, cellSize * chunkSize) - cellSize * chunkSize,
    )
  })
}

export function initGrid({ app }: { app: Application<ICanvas> }) {
  initCellGrid({ app })
  initChunkGrid({ app })
}
