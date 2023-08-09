import { BeltEntity, EntityType } from './entity-types.js'

export function newBelt(
  args: Omit<BeltEntity, 'id' | 'type' | 'items' | 'connections'>,
): Omit<BeltEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Belt,
    items: [],
    connections: {
      input: new Set(),
      output: new Set(),
    },
  }
}
