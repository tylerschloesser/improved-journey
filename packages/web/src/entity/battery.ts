import { EntityType, BatteryEntity } from '../entity-types.js'

export function newBattery(
  args: Omit<BatteryEntity, 'id' | 'type' | 'nodes'>,
): Omit<BatteryEntity, 'id'> {
  return { ...args, type: EntityType.Battery, nodes: [] }
}
