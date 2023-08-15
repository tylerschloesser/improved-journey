import invariant from 'tiny-invariant'
import { LAB_CONSUMPTION, RESEARCH_SPEED } from '../const.js'
import { LabEntity } from '../entity-types.js'
import { TickEntityFn } from './tick-types.js'

export interface LabState {
  consumption: number
}

export function getLabState(entity: LabEntity): LabState {
  let consumption = 0

  if (entity.progress !== null) {
    consumption = LAB_CONSUMPTION.perTick()
  } else if (entity.input !== null) {
    invariant(entity.input.count > 0)
    consumption = LAB_CONSUMPTION.perTick()
  }

  return { consumption }
}

export const tickLab: TickEntityFn<LabEntity> = ({
  entity,
  world,
  satisfaction,
}) => {
  const state = getLabState(entity)

  // TODO this is kind of hacky to check for zero
  if (state.consumption === 0) return

  let progress = RESEARCH_SPEED.perTick() * satisfaction

  if (entity.progress !== null) {
    invariant(entity.target !== null)

    entity.progress += progress

    if (entity.progress >= 1) {
      world.research[entity.target] = (world.research[entity.target] ?? 0) + 1

      progress = entity.progress - 1
      invariant(progress < 1)
      entity.progress = null
      entity.target = null
    }
  }

  if (entity.progress === null && progress > 0) {
    invariant(entity.input)
    invariant(entity.target === null)

    entity.target = entity.input.type
    entity.input.count -= 1
    if (entity.input.count === 0) {
      entity.input = null
    }

    entity.progress = progress
  }
}
