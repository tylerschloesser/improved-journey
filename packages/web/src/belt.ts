import { BuildBeltEntity, EntityType } from './entity-types.js'

export function newBelt(
  args: Omit<BuildBeltEntity, 'type' | 'items'>,
): BuildBeltEntity {
  return { ...args, type: EntityType.Belt, items: [] }
}
