import { EntityType, MinerEntity } from './entity-types.js'

export function newMiner(
  args: Omit<MinerEntity, 'id' | 'type' | 'progress' | 'output'>,
): Omit<MinerEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Miner,
    progress: 0,
    output: {
      queue: null,
      node: null,
    },
  }
}
