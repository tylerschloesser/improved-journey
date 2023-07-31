import { Entity, EntityNode } from './game-state.js'

export function newMiner(args: Omit<Entity, 'nodes'>): Entity {
  const nodes: EntityNode[] = []
  return { ...args, nodes }
}
