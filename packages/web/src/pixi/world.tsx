import React, { Suspense } from 'react'
import { Container, Stage } from '@pixi/react'
import { bind, Subscribe } from '@react-rxjs/core'
import { cellSize$, position$, viewport$ } from '../game-state.js'
import { Build } from './build.js'
import { Connection } from './connection.js'
import { Grid } from './grid.js'
import { Entities } from './entities.js'
import * as PIXI from 'pixi.js'

const [usePosition] = bind(position$)
const [useCellSize] = bind(cellSize$)
const [useViewport] = bind(viewport$)

function useTransform() {
  const position = usePosition()
  const cellSize = useCellSize()
  const viewport = useViewport()
  return {
    translate: position.mul(cellSize * -1).add(viewport.div(2)),
    scale: cellSize,
  }
}

function Transform({ children }: React.PropsWithChildren) {
  const transform = useTransform()
  return (
    <Container
      x={transform.translate.x}
      y={transform.translate.y}
      scale={transform.scale}
      sortableChildren={true}
    >
      {children}
    </Container>
  )
}

export type WorldProps = React.PropsWithoutRef<{
  canvas: HTMLCanvasElement
}>

export function World({ canvas }: WorldProps) {
  return (
    <Stage
      options={{
        resizeTo: window,
        view: canvas,
      }}
      onMount={(app) => {
        PIXI.Container.defaultSortableChildren = true
        // hack because @pixi/react doesn't
        // respect my initial size...
        window.setTimeout(() => {
          app.resize?.()
        }, 0)
      }}
    >
      {/* TODO I need this subscribe here even though I already
        have on in index. Not sure why.. something to do with @pixi/react */}
      <Subscribe>
        <Suspense>
          <Grid />
          <Transform>
            <Entities />
            <Build />
            <Connection />
          </Transform>
        </Suspense>
      </Subscribe>
    </Stage>
  )
}
