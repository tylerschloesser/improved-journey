import { times } from 'lodash-es'
import invariant from 'tiny-invariant'
import {
  BATTERY_CAPACITY,
  BATTERY_CHARGE_RATE,
  BATTERY_DISCHARGE_RATE,
  BELT_CONSUMPTION,
  COAL_BURN_RATE,
  COAL_ENERGY,
  MINER_CONSUMPTION,
  SOLAR_PANEL_RATE,
} from '../const.js'
import { BatteryEntity, Entity, EntityType } from '../entity-types.js'
import { ItemType } from '../item-types.js'
import { World } from '../types.js'
import { getSmelterState } from './smelter-state.js'

export function tickEnergy(world: World): { satisfaction: number } {
  let consumption = 0
  let production = 0
  let batteries: BatteryEntity[] = []

  for (const entity of Object.values(world.entities) as Entity[]) {
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

  let satisfaction = consumption === 0 ? 1 : production / consumption

  return { satisfaction }
}
