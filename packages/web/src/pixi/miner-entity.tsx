import { Container, Graphics } from '@pixi/react'
import { MinerEntity } from '../entity-types.js'
import { Vec2 } from '../vec2.js'
import { drawItem } from './draw-item.js'
import { EntityProps } from './entity-props.js'
import { ProgressText } from './ProgressText.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export function MinerEntity({ entity, color }: EntityProps<MinerEntity>) {
  const drawBackground = useDraw(
    (g) => {
      g.clear()

      g.beginFill(color)

      const [x, y] = entity.position
      const [width, height] = entity.size

      g.drawRect(x, y, width, height)
    },
    [entity, color],
  )

  const drawTarget = useDraw(
    (g) => {
      g.clear()
      if (entity.target === null) return
      drawItem({
        itemType: entity.target,
        g,
        position: new Vec2(entity.position).add(new Vec2(1.5, 0.5)),
      })
    },
    [entity],
  )

  const progress = Math.trunc(entity.progress * 100)

  const [x, y] = entity.position
  const [width, height] = entity.size

  return (
    <Container zIndex={ZIndex.entity}>
      <Graphics draw={drawBackground} />
      <Container x={x} y={y} width={width} height={height}>
        <ProgressText progress={progress} />
      </Container>
      <Graphics draw={drawTarget} />
    </Container>
  )
}
