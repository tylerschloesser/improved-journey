import { EntityConfig } from '../entity-config.js'

export interface EntityProps<T> {
  entity: T
  config: EntityConfig
}
