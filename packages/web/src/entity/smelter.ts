import { EntityType, SmelterEntity } from '../entity-types.js'

export function newSmelter(
  args: Omit<SmelterEntity, 'id' | 'type'>,
): Omit<SmelterEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Smelter,
  }
}
