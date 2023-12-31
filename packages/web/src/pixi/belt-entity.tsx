import { Container, Graphics } from '@pixi/react'
import { reverse } from 'lodash-es'
import { BeltEntity } from '../entity-types.js'
import { directionToAngle } from '../util.js'
import { Vec2 } from '../vec2.js'
import { drawItem } from './draw-item.js'
import { EntityProps } from './entity-props.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export function BeltEntity({ entity, color }: EntityProps<BeltEntity>) {
  const drawBelt = useDraw(
    (g) => {
      g.clear()
      g.beginFill(color)
      g.drawRect(0, 0, 1, 1)
    },
    [color],
  )

  const drawItems = useDraw(
    (g) => {
      g.clear()

      for (const item of reverse(entity.items)) {
        drawItem({
          itemType: item.type,
          g,
          position: new Vec2(item.progress, 0),
        })
      }
    },
    [entity],
  )

  const [x, y] = entity.position
  const [width, height] = entity.size

  return (
    <>
      <Container x={x} y={y} width={width} height={height} zIndex={ZIndex.belt}>
        <Graphics draw={drawBelt} />
      </Container>
      <Container
        x={x}
        y={y}
        width={width}
        height={height}
        zIndex={ZIndex.beltItems}
      >
        <Container
          angle={directionToAngle(entity.direction)}
          position={[0.5, 0.5]}
        >
          <Graphics draw={drawItems} position={[-0.5, 0]} />
        </Container>
      </Container>
    </>
  )
}
