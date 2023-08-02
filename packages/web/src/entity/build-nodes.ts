import { Entity, EntityNode } from '../types.js'
import { Vec2 } from '../vec2.js'

export function buildNodes(
  entity: Omit<Entity, 'id' | 'type' | 'nodes'>,
): EntityNode[] {
  const nodes: EntityNode[] = []
  const { size } = entity

  for (let x = 0; x < size.x; x++) {
    nodes.push(
      {
        position: new Vec2(x, -1),
      },
      {
        position: new Vec2(x, size.y),
      },
    )
  }

  for (let y = 0; y < size.y; y++) {
    nodes.push(
      {
        position: new Vec2(-1, y),
      },
      {
        position: new Vec2(size.x, y),
      },
    )
  }

  return nodes.map((node) => ({
    ...node,
    position: node.position.add(entity.position),
  }))
}
