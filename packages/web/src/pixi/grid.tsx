import React, { useCallback } from 'react'
import { Container, Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import { cellSize$, position$, viewport$, zoom$ } from '../game-state.js'
import { CHUNK_SIZE } from '../const.js'

const [useZoom] = bind(zoom$)
const [useViewport] = bind(viewport$)
const [usePosition] = bind(position$)
const [useCellSize] = bind(cellSize$)

function Cells() {
  const zoom = useZoom()
  const viewport = useViewport()
  const position = usePosition()
  const cellSize = useCellSize()

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()

      g.lineStyle(2, 'hsl(0, 0%, 10%)')

      const rows = Math.ceil(viewport.y / cellSize) + 1
      const cols = Math.ceil(viewport.x / cellSize) + 1

      for (let x = 0; x < cols; x++) {
        g.moveTo(x * cellSize, 0).lineTo(x * cellSize, cellSize * rows)
      }

      for (let y = 0; y < rows; y++) {
        g.moveTo(0, y * cellSize).lineTo(cellSize * cols, y * cellSize)
      }
    },
    [viewport, cellSize],
  )

  const translate = position
    .sub(viewport.div(cellSize).div(2))
    .mul(-1)
    .mod(1)
    .sub(1)
    .mul(cellSize)

  return (
    <Container alpha={zoom} x={translate.x} y={translate.y}>
      <Graphics draw={draw} />
    </Container>
  )
}

function Chunks() {
  const viewport = useViewport()
  const position = usePosition()
  const cellSize = useCellSize()

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()

      g.lineStyle(2, 'hsl(0, 0%, 30%)')

      const rows = Math.ceil(viewport.y / cellSize / CHUNK_SIZE) + 1
      const cols = Math.ceil(viewport.x / cellSize / CHUNK_SIZE) + 1

      for (let x = 0; x < cols; x++) {
        g.moveTo(x * cellSize * CHUNK_SIZE, 0).lineTo(
          x * cellSize * CHUNK_SIZE,
          cellSize * CHUNK_SIZE * rows,
        )
      }

      for (let y = 0; y < rows; y++) {
        g.moveTo(0, y * cellSize * CHUNK_SIZE).lineTo(
          cellSize * CHUNK_SIZE * cols,
          y * cellSize * CHUNK_SIZE,
        )
      }
    },
    [viewport, cellSize],
  )

  const translate = position
    .sub(viewport.div(cellSize).div(2))
    .div(CHUNK_SIZE)
    .mul(-1)
    .mod(1)
    .sub(1)
    .mul(cellSize * CHUNK_SIZE)

  return (
    <Container x={translate.x} y={translate.y}>
      <Graphics draw={draw} />
    </Container>
  )
}

export function Grid() {
  return (
    <>
      <Cells />
      <Chunks />
    </>
  )
}
