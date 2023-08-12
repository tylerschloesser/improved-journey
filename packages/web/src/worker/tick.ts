import { times } from 'lodash-es'
import invariant from 'tiny-invariant'
import {
  BATTERY_CAPACITY,
  BATTERY_CHARGE_RATE,
  BATTERY_DISCHARGE_RATE,
  BELT_CONSUMPTION,
  BELT_SPEED,
  COAL_BURN_RATE,
  COAL_ENERGY,
  MINER_CONSUMPTION,
  MINE_RATE,
  Recipe,
  RECIPES,
  SMELTER_CONSUMPTION,
  SOLAR_PANEL_RATE,
} from '../const.js'
import {
  BatteryEntity,
  BeltEntity,
  Entity,
  EntityType,
  SmelterEntity,
} from '../entity-types.js'
import { ItemType } from '../item-types.js'
import { TickResponse, World } from '../types.js'

interface SmelterState {
  consumption: number
  recipe: Recipe | null
  ready: number
}

function getSmelterState(smelter: SmelterEntity): SmelterState {
  let state: SmelterState = {
    consumption: 0,
    recipe: null,
    ready: 0,
  }
  if (smelter.target === null) return state

  state.recipe = RECIPES[smelter.target] ?? null

  invariant(state.recipe !== null)
  invariant(state.recipe.input.length === 1)

  if (smelter.input && smelter.input.type === state.recipe.input[0].type) {
    state.ready = Math.floor(smelter.input.count / state.recipe.input[0].count)
  }

  if (state.ready || smelter.progress) {
    state.consumption = SMELTER_CONSUMPTION.perTick()
  }

  return state
}

export function tickWorld(world: World): TickResponse {
  let consumption = 0
  let production = 0
  let batteries: BatteryEntity[] = []

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Belt: {
        consumption += BELT_CONSUMPTION.perTick()
        break
      }
      case EntityType.Miner: {
        if (entity.target !== null) {
          consumption += MINER_CONSUMPTION.perTick()
        }
        break
      }
      case EntityType.Smelter: {
        consumption += getSmelterState(entity).consumption
        break
      }
      case EntityType.Generator: {
        let { burning } = entity

        if (!burning && entity.fuel) {
          burning = entity.burning = { type: entity.fuel.type, progress: 0 }
          entity.fuel.count -= 1
          if (entity.fuel.count === 0) {
            entity.fuel = null
          }
        }

        if (burning) {
          invariant(burning.type === ItemType.Coal)

          const remaining = COAL_ENERGY * (1 - burning.progress)

          let burned: number
          if (remaining <= COAL_BURN_RATE.perTick()) {
            burned = remaining
            entity.burning = null
          } else {
            burned = COAL_BURN_RATE.perTick()
            burning.progress += burned / COAL_ENERGY
          }

          production += burned
        }

        break
      }
      case EntityType.SolarPanel:
        production += SOLAR_PANEL_RATE.perTick()
        break
      case EntityType.Battery: {
        batteries.push(entity)
        break
      }
    }
  }

  if (consumption > production) {
    // increase production by consuming from batteries

    // sort batteries, lowest charge first
    batteries.sort((a, b) => a.charge - b.charge)

    for (const i of times(batteries.length)) {
      const battery = batteries[i]

      const needed = consumption - production
      const average = Math.min(
        needed / (batteries.length - i),
        BATTERY_DISCHARGE_RATE.perTick(),
      )
      invariant(average > 0)

      const produce = Math.min(battery.charge, average)
      battery.charge -= produce
      production += produce
    }
  } else if (production > consumption) {
    // increase consumption by storing in batteries

    // sort batteries, highest charge first
    batteries.sort((a, b) => b.charge - a.charge)

    for (const i of times(batteries.length)) {
      const battery = batteries[i]

      const extra = production - consumption
      const average = Math.min(
        extra / (batteries.length - 1),
        BATTERY_CHARGE_RATE.perTick(),
      )
      invariant(average > 0)

      const consume = Math.min(
        BATTERY_CAPACITY - battery.charge,
        BATTERY_CHARGE_RATE.perTick(),
      )
      battery.charge += consume
      consumption += consume
    }
  }

  const satisfaction = Math.min(
    consumption === 0 ? 1 : production / consumption,
    1,
  )

  // not super elegent, but a simple way to ensure
  // we don't move items twice in one tick
  const moved = new Set<BeltEntity['items'][0]>()

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Miner: {
        if (entity.target === null) break

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
        break
      }
      case EntityType.Belt: {
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

  return {
    world,
    satisfaction,
  }
}
