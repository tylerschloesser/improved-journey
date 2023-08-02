import { Entity, EntityType } from '../types.js'
import { buildNodes } from './build-nodes.js'

export function newGenerator(
  args: Omit<Entity, 'id' | 'type' | 'nodes'>,
): Omit<Entity, 'id'> {
  return { ...args, type: EntityType.Generator, nodes: buildNodes(args) }
}
