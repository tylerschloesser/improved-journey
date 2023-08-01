import { Entity } from './game-state.js'

export function newBelt(args: Omit<Entity, 'nodes'>): Entity {
  return { ...args, nodes: [] }
}
