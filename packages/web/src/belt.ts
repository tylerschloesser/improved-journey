import { BeltEntity, EntityType } from './entity-types.js'

export function newBelt(
  args: Omit<BeltEntity, 'id' | 'type'>,
): Omit<BeltEntity, 'id'> {
  return { ...args, type: EntityType.Belt }
}
