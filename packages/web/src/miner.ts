import { buildNodes } from './entity/build-nodes.js'
import { Entity, EntityType } from './types.js'

export function newMiner(
  args: Omit<Entity, 'id' | 'type' | 'nodes'>,
): Omit<Entity, 'id'> {
  return { ...args, type: EntityType.Miner, nodes: buildNodes(args) }
}
