import { Entity, EntityType } from '../types.js'
import { buildNodes } from './build-nodes.js'

export function newGenerator(args: Omit<Entity, 'type' | 'nodes'>): Entity {
  return { ...args, type: EntityType.Generator, nodes: buildNodes(args) }
}
