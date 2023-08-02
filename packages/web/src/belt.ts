import { Entity, EntityType } from './types.js'

export function newBelt(args: Omit<Entity, 'type' | 'nodes'>): Entity {
  return { ...args, type: EntityType.Belt, nodes: [] }
}
