import { Graphics } from '@pixi/react'
import { reverse } from 'lodash-es'
import { BeltEntity } from '../entity-types.js'
import { Vec2 } from '../vec2.js'
import { drawItem } from './draw-item.js'
import { EntityProps } from './entity-props.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export function BeltEntity({ entity, config }: EntityProps<BeltEntity>) {
  const drawBelt = useDraw(
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

  const drawItems = useDraw(
    (g) => {
      g.clear()

      for (const item of reverse(entity.items)) {
        drawItem({
          itemType: item.type,
          g,
          position: new Vec2(
            entity.position.x + item.progress,
            entity.position.y + 0.5,
          ),
        })
      }
    },
    [entity],
  )

  return (
    <>
      <Graphics draw={drawBelt} zIndex={ZIndex.belt} />
      <Graphics draw={drawItems} zIndex={ZIndex.beltItems} />
    </>
  )
}
