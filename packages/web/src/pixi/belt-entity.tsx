import { Graphics } from '@pixi/react'
import { BeltEntity } from '../entity-types.js'
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
      g.beginFill('black')
      g.lineStyle(0.05, 'gray')
      for (const item of entity.items) {
        g.drawCircle(
          entity.position.x + item.progress,
          entity.position.y + 0.5,
          0.25,
        )
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
