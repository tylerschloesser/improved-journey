import invariant from 'tiny-invariant'
import { RESEARCH_SPEED } from '../const.js'
import { LabEntity } from '../entity-types.js'
import { TickEntityFn } from './tick-types.js'

export const tickLab: TickEntityFn<LabEntity> = ({
  entity,
  world,
  satisfaction,
}) => {
  if (entity.input === null) return
  invariant(entity.input.count > 0)

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
    invariant(entity.target === null)

    entity.target = entity.input.type
    entity.input.count -= 1
    if (entity.input.count === 0) {
      entity.input = null
    }

    entity.progress = progress
  }
}
