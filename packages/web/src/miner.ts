import { Entity, EntityType, MinerEntity } from './entity-types.js'

export function newMiner(
  args: Omit<Entity, 'id' | 'type'>,
): Omit<MinerEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Miner,
    progress: 0,
    output: null,
  }
}
