import { EntityType, BatteryEntity, Entity } from '../entity-types.js'

export function newBattery(
  args: Omit<Entity, 'id' | 'type'>,
): Omit<BatteryEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Battery,
    charge: 0,
  }
}
