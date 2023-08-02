import { buildNodes } from './entity/build-nodes.js'
import { Entity, EntityType, MinerEntity } from './types.js'

export function newMiner(
  args: Omit<Entity, 'id' | 'type' | 'nodes'>,
): Omit<MinerEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Miner,
    nodes: buildNodes(args),
    progress: 0,
    output: null,
  }
}
