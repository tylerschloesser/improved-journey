import { Container, Graphics } from '@pixi/react'
import { LabEntity } from '../entity-types.js'
import { EntityProps } from './entity-props.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export function LabEntity({ entity, config }: EntityProps<LabEntity>) {
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

  return (
    <Container zIndex={ZIndex.entity}>
      <Graphics draw={drawBackground} zIndex={ZIndex.entity} />
    </Container>
  )
}
