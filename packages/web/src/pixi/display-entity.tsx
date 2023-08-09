import { Container, Graphics, Text } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import { useMemo } from 'react'
import { DisplayEntity } from '../entity-types.js'
import { satisfaction$, ZoomLevel, zoomLevel$ } from '../game-state.js'
import { EntityProps } from './entity-props.js'
import { useDraw } from './use-draw.js'

const [useSatisfaction] = bind(satisfaction$)
const [useZoomLevel] = bind(zoomLevel$)

export function DisplayEntity({ entity, config }: EntityProps<DisplayEntity>) {
  const satisfaction = useSatisfaction()
  const zoomLevel = useZoomLevel()

  const [x, y] = entity.position
  const [width, height] = entity.size

  const drawBackground = useDraw(
    (g) => {
      g.clear()
      g.beginFill(config.color)
      g.drawRect(x, y, width, height)
    },
    [entity],
  )

  const textStyle = useMemo(
    () => new PIXI.TextStyle({ fill: 'black', align: 'center', fontSize: 40 }),
    [],
  )

  return (
    <>
      <Graphics draw={drawBackground} />
      <Container
        x={x}
        y={y}
        width={width}
        height={height}
        scale={0.01}
        visible={zoomLevel !== ZoomLevel.Low}
      >
        <Text
          text={`sat\n${Math.trunc(satisfaction * 100)}%`}
          style={textStyle}
        />
      </Container>
    </>
  )
}
