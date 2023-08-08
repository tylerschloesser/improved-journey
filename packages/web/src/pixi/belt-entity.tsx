import { Graphics } from '@pixi/react'
import { BeltEntity } from '../entity-types.js'
import { ItemType } from '../item-types.js'
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

      g.lineStyle(0.05, 'gray')
      for (const item of entity.items) {
        switch (item.type) {
          case ItemType.Coal:
            g.beginFill('black')
            break
          case ItemType.IronOre:
            g.beginFill('silver')
            break
          default:
            throw `TODO no color for ${item.type}`
        }

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
