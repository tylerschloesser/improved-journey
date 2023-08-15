import { Container, Graphics } from '@pixi/react'
import { SmelterEntity } from '../entity-types.js'
import { Vec2 } from '../vec2.js'
import { drawItem } from './draw-item.js'
import { EntityProps } from './entity-props.js'
import { ProgressText } from './ProgressText.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export function SmelterEntity({ entity, config }: EntityProps<SmelterEntity>) {
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

  let progress = null
  if (entity.progress !== null) {
    progress = Math.trunc(entity.progress * 100)
  }

  return (
    <Container zIndex={ZIndex.entity}>
      <Graphics draw={drawBackground} />
      <Container x={x} y={y} width={width} height={height}>
        {progress && <ProgressText progress={progress} />}
      </Container>
      <Graphics draw={drawTarget} />
    </Container>
  )
}
