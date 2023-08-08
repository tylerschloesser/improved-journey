import { Container, Graphics } from '@pixi/react'
import { SmelterEntity } from '../entity-types.js'
import { Vec2 } from '../vec2.js'
import { drawItem } from './draw-item.js'
import { EntityProps } from './entity-props.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export function SmelterEntity({ entity, config }: EntityProps<SmelterEntity>) {
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

  const drawTarget = useDraw(
    (g) => {
      g.clear()
      if (entity.target === null) return
      drawItem({
        itemType: entity.target,
        g,
        position: entity.position.add(new Vec2(1.5, 0.5)),
      })
    },
    [entity],
  )

  return (
    <Container zIndex={ZIndex.entity}>
      <Graphics draw={drawBackground} />
      <Graphics draw={drawTarget} />
    </Container>
  )
}
