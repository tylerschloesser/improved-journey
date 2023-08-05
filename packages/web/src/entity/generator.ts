import { Entity, EntityType, GeneratorEntity } from '../entity-types.js'

export function newGenerator(
  args: Omit<Entity, 'id' | 'type'>,
): Omit<GeneratorEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Generator,
    fuel: null,
    burning: null,
  }
}
