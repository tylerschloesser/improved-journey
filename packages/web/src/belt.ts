import { Entity, EntityType } from './types.js'

export function newBelt(
  args: Omit<Entity, 'id' | 'type' | 'nodes'>,
): Omit<Entity, 'id'> {
  return { ...args, type: EntityType.Belt, nodes: [] }
}
