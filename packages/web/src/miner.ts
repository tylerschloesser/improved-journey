import { Entity, EntityNode } from './game-state.js'
import { Vec2 } from './vec2.js'

export function newMiner(args: Omit<Entity, 'nodes'>): Entity {
  return { ...args, nodes: buildNodes(args) }
}

function buildNodes({ size }: { size: Vec2 }): EntityNode[] {
  const nodes: EntityNode[] = []

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

  return nodes
}
