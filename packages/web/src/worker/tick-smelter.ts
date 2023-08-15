import invariant from 'tiny-invariant'
import { EntityType, SmelterEntity } from '../entity-types.js'
import { getSmelterState } from './smelter-state.js'
import { TickEntityFn } from './tick-types.js'

export const tickSmelter: TickEntityFn<SmelterEntity> = ({
  entity,
  world,
  satisfaction,
  moved,
}) => {
  if (entity.target === null) return
  const state = getSmelterState(entity)
  if (state.recipe === null) {
    invariant(state.consumption === 0)
    invariant(state.ready === 0)
    return
  }

  let progress = state.recipe.speed.perTick() * satisfaction

  if (entity.progress !== null) {
    entity.progress += progress
    if (entity.progress >= 1) {
      let output = entity.output
      if (output === null) {
        output = entity.output = { type: entity.target, count: 0 }
      }
      invariant(entity.output && entity.output.type === entity.target)
      output.count += 1
      progress = entity.progress - 1
      invariant(progress < 1)
      entity.progress = null
    }
  }

  if (entity.progress === null && state.ready && progress > 0) {
    invariant(entity.input)
    invariant(entity.input.type === state.recipe.input[0]?.type)
    invariant(entity.input.count >= state.recipe.input[0].count)
    entity.input.count -= state.recipe.input[0].count
    if (entity.input.count === 0) {
      entity.input = null
    }
    entity.progress = progress
  }

  if (entity.output && entity.connections.output.size > 0) {
    invariant(entity.output.count > 0)
    invariant(entity.connections.output.size === 1)

    const targetEntityId = Array.from(entity.connections.output)[0]
    invariant(targetEntityId)
    const target = world.entities[targetEntityId]

    invariant(target)
    invariant(target.type === EntityType.Belt)

    const item = {
      type: entity.output.type,
      progress: 0,
    }
    target.items.push(item)
    entity.output.count -= 1
    if (entity.output.count === 0) {
      entity.output = null
    }
    // make sure we don't also move the new item
    // during the same tick
    moved.add(item)
  }
}
