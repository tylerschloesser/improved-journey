import { EntityType, BatteryEntity, Entity } from '../entity-types.js'

export function newBattery(
  args: Omit<Entity, 'id' | 'type' | 'nodes'>,
): Omit<BatteryEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Battery,
    nodes: [],
    charge: 0,
    capacity: 100,
  }
}
