import { BeltEntity, EntityId, EntityType } from './entity-types.js'

export function newBelt(
  args: Omit<BeltEntity, 'id' | 'type' | 'prev' | 'next'> & {
    prev?: EntityId
    next?: EntityId
  },
): Omit<BeltEntity, 'id' | 'prev' | 'next'> & {
  prev?: EntityId
  next?: EntityId
} {
  return { ...args, type: EntityType.Belt }
}
