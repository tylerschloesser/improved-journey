import { Entity, EntityType } from './entity-types.js'

export function newBelt(args: Omit<Entity, 'id' | 'type'>): Omit<Entity, 'id'> {
  return { ...args, type: EntityType.Belt }
}
