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
  SOLAR_PANEL_RATE,
} from '../const.js'
import { BatteryEntity, EntityType } from '../entity-types.js'
import { ItemType } from '../item-types.js'
import { World } from '../types.js'

export function tickWorld(world: World): {
  world: World
  satisfaction: number
} {
  let consumption = 0
  let production = 0
  let batteries: BatteryEntity[] = []

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Belt:
        consumption += BELT_CONSUMPTION.perTick()
      case EntityType.Miner:
        consumption += MINER_CONSUMPTION.perTick()
        break
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

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Miner: {
        entity.progress += MINE_RATE.perTick() * satisfaction
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
      case EntityType.Belt: {
        const prev = world.entities[entity.prev]
        invariant(prev)
        switch (prev.type) {
          case EntityType.Miner:
            if (prev.output) {
              for (let i = 0; i < prev.output.count; i++) {
                entity.items.push({ type: prev.output.type, progress: 0 })
              }
              prev.output = null
            }
            break
        }

        const next = world.entities[entity.next]
        invariant(next)
        const remove = new Set<(typeof entity.items)[0]>()
        for (const item of entity.items) {
          item.progress += BELT_SPEED.perTick() * satisfaction
          if (item.progress >= 1) {
            remove.add(item)
            switch (next.type) {
              case EntityType.Belt: {
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
              }
            }
          }
        }
        if (remove.size) {
          entity.items = entity.items.filter((item) => !remove.has(item))
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
