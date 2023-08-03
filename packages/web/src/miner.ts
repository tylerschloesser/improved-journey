import { Entity, EntityType, MinerEntity } from './entity-types.js'
import { buildNodes } from './entity/build-nodes.js'

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
