import { cloneDeep, times } from 'lodash-es'
import invariant from 'tiny-invariant'
import {
  BATTERY_CAPACITY,
  BATTERY_CHARGE_RATE,
  BATTERY_DISCHARGE_RATE,
  COAL_BURN_RATE,
  COAL_ENERGY,
  MINE_RATE,
  SOLAR_PANEL_RATE,
  TICK_RATE,
} from './const.js'
import { BatteryEntity, EntityType } from './entity-types.js'
import { world$ } from './game-state.js'
import { ItemType } from './item-types.js'

export function tickWorld() {
  const world = cloneDeep(world$.value)

  let consumption = 0
  let production = 0
  let batteries: BatteryEntity[] = []

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Miner:
        consumption += 1
        break
      case EntityType.Generator: {
        const { burning } = entity
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

  const satisfaction = consumption === 0 ? 1 : production / consumption

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Miner: {
        entity.progress += (MINE_RATE.perTick() * satisfaction) / TICK_RATE
        if (entity.progress >= 1) {
          const count = Math.trunc(entity.progress)
          entity.progress = entity.progress - count

          let output = entity.output
          if (output === null) {
            output = entity.output = { type: ItemType.Coal, count: 0 }
          }
          output.count += count
        }
        break
      }
    }
  }

  world.tick += 1
  world$.next(world)
}
