import { EntityType, SolarPanelEntity } from '../entity-types.js'

export function newSolarPanel(
  args: Omit<SolarPanelEntity, 'id' | 'type' | 'nodes'>,
): Omit<SolarPanelEntity, 'id'> {
  return { ...args, type: EntityType.SolarPanel, nodes: [] }
}
