import { Container, Graphics, Text } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { DisplayContentType, DisplayEntity } from '../entity-types.js'
import { satisfaction$ } from '../game-state.js'
import { EntityProps } from './entity-props.js'
import { useDraw } from './use-draw.js'

const [useSatisfaction] = bind(satisfaction$)

function Satisfaction({ entity }: EntityProps<DisplayEntity>) {
  invariant(entity.content?.type === DisplayContentType.Satisfaction)

  const satisfaction = useSatisfaction()

  const [x, y] = entity.position
  const [width, height] = entity.size

  let backgroundColor = '#7EBC89' // green
  if (satisfaction < 0.9) {
    backgroundColor = '#FE5D26' // orange
  }

  const drawBackground = useDraw(
    (g) => {
      g.clear()
      g.beginFill(backgroundColor)
      g.drawRect(x, y, width, height)
    },
    [entity, backgroundColor],
  )

  const textStyle = useMemo(
    () => new PIXI.TextStyle({ fill: 'black', align: 'center', fontSize: 80 }),
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
        // visible={zoomLevel !== ZoomLevel.Low}
      >
        <Text
          text={`sat\n${Math.trunc(satisfaction * 100)}%`}
          style={textStyle}
        />
      </Container>
    </>
  )
}

export function DisplayEntity(props: EntityProps<DisplayEntity>) {
  if (!props.entity.content?.type) {
    return null
  }
  switch (props.entity.content.type) {
    case DisplayContentType.Satisfaction:
      return <Satisfaction {...props} />
    default:
      throw 'invalid display content type'
  }
}
