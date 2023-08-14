import invariant from 'tiny-invariant'
import { BELT_SPEED, MINE_RATE } from '../const.js'
import { BeltEntity, Entity, EntityType, MinerEntity } from '../entity-types.js'
import { TickStats, World } from '../types.js'
import { getSmelterState } from './smelter-state.js'
import { tickEnergy } from './tick-energy.js'

interface TickEntityArgs<T extends Entity> {
  entity: T
  world: World
  satisfaction: number
  moved: Set<BeltEntity['items'][0]>
}

type TickEntityFn<T extends Entity> = (args: TickEntityArgs<T>) => void

const tickMiner: TickEntityFn<MinerEntity> = ({
  entity,
  world,
  satisfaction,
  moved,
}) => {
  if (entity.target === null) return

  if (entity.output && entity.connections.output.size > 0) {
    invariant(entity.output.count > 0)

    invariant(entity.connections.output.size === 1)
    const targetEntityId = Array.from(entity.connections.output)[0]
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

  entity.progress += MINE_RATE.perTick() * satisfaction
  if (entity.progress >= 1) {
    const count = Math.trunc(entity.progress)
    entity.progress = entity.progress - count

    let output = entity.output
    if (output === null) {
      output = entity.output = { type: entity.target, count: 0 }
    }
    invariant(output.type === entity.target)
    output.count += count
  }
}

export const tickBelt: TickEntityFn<BeltEntity> = ({
  entity,
  world,
  satisfaction,
  moved,
}) => {
  const remove = new Set<(typeof entity.items)[0]>()
  for (const item of entity.items) {
    // check if the item was just moved onto this belt
    if (moved.has(item)) continue

    item.progress += BELT_SPEED.perTick() * satisfaction
    if (item.progress >= 1) {
      let next: Entity | null = null
      if (entity.connections.output.size > 0) {
        invariant(entity.connections.output.size === 1)
        next = world.entities[Array.from(entity.connections.output)[0]]
        invariant(next)
      }

      if (next === null) {
        item.progress = 1
      } else {
        remove.add(item)
        switch (next.type) {
          case EntityType.Belt: {
            moved.add(item)
            next.items.push(item)
            item.progress -= 1
            break
          }
          case EntityType.Generator: {
            let fuel = next.fuel
            if (!fuel) {
              fuel = next.fuel = { type: item.type, count: 0 }
            }
            invariant(fuel.type === item.type)
            fuel.count += 1
            break
          }
          case EntityType.Smelter: {
            let input = next.input
            if (!input) {
              input = next.input = { type: item.type, count: 0 }
            }
            invariant(input.type === item.type)
            input.count += 1
            break
          }
          case EntityType.Storage: {
            next.items[item.type] = (next.items[item.type] ?? 0) + 1
            break
          }
        }
      }
    }
  }
  if (remove.size) {
    entity.items = entity.items.filter((item) => !remove.has(item))
  }
}

export function tickWorld(world: World): TickStats {
  let { satisfaction } = tickEnergy(world)

  const stats: TickStats = { satisfaction }

  // clamp satisfaction to 1, because it's used to scale
  // entity work below.
  satisfaction = Math.min(satisfaction, 1)

  // not super elegent, but a simple way to ensure
  // we don't move items twice in one tick
  const moved = new Set<BeltEntity['items'][0]>()

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Miner: {
        tickMiner({ entity, world, satisfaction, moved })
        break
      }
      case EntityType.Belt: {
        tickBelt({ entity, world, satisfaction, moved })
        break
      }
      case EntityType.Smelter: {
        if (entity.target === null) break
        const state = getSmelterState(entity)
        if (state.recipe === null) {
          invariant(state.consumption === 0)
          invariant(state.ready === 0)
          break
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
          invariant(entity.input.type === state.recipe.input[0].type)
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

        break
      }
    }
  }

  world.tick += 1

  return stats
}
