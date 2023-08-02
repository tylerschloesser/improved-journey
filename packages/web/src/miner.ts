import { buildNodes } from './entity/build-nodes.js'
import { Entity, EntityType } from './types.js'

export function newMiner(args: Omit<Entity, 'type' | 'nodes'>): Entity {
  return { ...args, type: EntityType.Miner, nodes: buildNodes(args) }
}
