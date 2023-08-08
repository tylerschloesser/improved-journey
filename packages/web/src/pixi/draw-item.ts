import { Graphics } from 'pixi.js'
import { ItemType } from '../item-types.js'
import { Vec2 } from '../vec2.js'

export function drawItem({
  itemType,
  g,
  position,
}: {
  itemType: ItemType
  g: Graphics
  position: Vec2
}): void {
  g.lineStyle(0.05, 'gray')
  switch (itemType) {
    case ItemType.Coal:
      g.beginFill('black')
      break
    case ItemType.IronOre:
      g.beginFill('silver')
      break
    default:
      throw `TODO no color for ${itemType}`
  }

  g.drawCircle(position.x, position.y, 0.25)
}
