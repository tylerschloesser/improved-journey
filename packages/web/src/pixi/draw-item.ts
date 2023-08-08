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
  switch (itemType) {
    case ItemType.Coal:
      g.lineStyle(0.05, 'gray')
      g.beginFill('black')
      g.drawCircle(position.x, position.y, 0.25)
      break
    case ItemType.IronOre:
      g.lineStyle(0.05, 'gray')
      g.beginFill('silver')
      g.drawCircle(position.x, position.y, 0.25)
      break
    case ItemType.IronPlate:
      g.lineStyle(0.05, 'gray')
      g.beginFill('silver')
      g.drawRect(position.x - 0.25, position.y - 0.25, 0.5, 0.5)
      break
    default:
      throw `TODO no color for ${itemType}`
  }
}
