import { Entity, EntityType, GeneratorEntity } from '../entity-types.js'
import { buildNodes } from './build-nodes.js'

export function newGenerator(
  args: Omit<Entity, 'id' | 'type' | 'nodes'>,
): Omit<GeneratorEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Generator,
    nodes: buildNodes(args),
    fuel: null,
  }
}
