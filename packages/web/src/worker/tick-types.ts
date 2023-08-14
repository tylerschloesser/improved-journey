import { BeltEntity, Entity } from '../entity-types'
import { World } from '../types'

export interface TickEntityArgs<T extends Entity> {
  entity: T
  world: World
  satisfaction: number
  moved: Set<BeltEntity['items'][0]>
}

export type TickEntityFn<T extends Entity> = (args: TickEntityArgs<T>) => void
