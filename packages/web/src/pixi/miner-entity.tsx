import { Container, Graphics, Text } from '@pixi/react'
import * as PIXI from 'pixi.js'
import { useMemo } from 'react'
import { MinerEntity } from '../entity-types.js'
import { EntityProps } from './entity-props.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export function MinerEntity({ entity, config }: EntityProps<MinerEntity>) {
  const drawBackground = useDraw(
    (g) => {
      g.clear()

      g.beginFill(config.color)
      g.drawRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      )
    },
    [entity],
  )

  const progress = Math.trunc(entity.progress * 100)

  const textStyle = useMemo(
    () => new PIXI.TextStyle({ fill: 'white', align: 'center', fontSize: 40 }),
    [],
  )

  return (
    <Container zIndex={ZIndex.entity}>
      <Graphics draw={drawBackground} />
      <Container
        x={entity.position.x}
        y={entity.position.y}
        width={entity.size.x}
        height={entity.size.y}
        scale={0.01}
      >
        <Text text={`${progress}%`} style={textStyle} />
      </Container>
    </Container>
  )
}
