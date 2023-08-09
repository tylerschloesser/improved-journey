import { EntityType } from './entity-types.js'
import { ItemType } from './item-types.js'

export const WORLD_VERSION = 1

enum RateType {
  PerSecond,
  PerTick,
}

class Rate {
  value: number
  constructor(value: number, type: RateType) {
    this.value = (() => {
      switch (type) {
        case RateType.PerSecond:
          return value / TICK_RATE
        case RateType.PerTick:
          return value
      }
    })()
  }

  perTick(): number {
    return this.value
  }
}

export const TICK_RATE = 10 // ticks/second

export const MINE_RATE = new Rate(1 / 5, RateType.PerSecond) // items/second

export const BATTERY_CHARGE_RATE = new Rate(20, RateType.PerSecond) // energy/second
export const BATTERY_DISCHARGE_RATE = new Rate(20, RateType.PerSecond) // energy/second
export const BATTERY_CAPACITY = 1000 // energy

export const SOLAR_PANEL_RATE = new Rate(1, RateType.PerSecond) // energy/second

export const CHUNK_SIZE = 10

export const COAL_ENERGY = 10_000
export const COAL_BURN_RATE = new Rate(10, RateType.PerTick)

export const BELT_CONSUMPTION = new Rate(0.1, RateType.PerTick)
export const MINER_CONSUMPTION = new Rate(1, RateType.PerTick)
export const SMELTER_CONSUMPTION = new Rate(1, RateType.PerTick)

// how long does it take for an item to move across a belt
export const BELT_SPEED = new Rate(1, RateType.PerSecond)

export const TARGET_OPTIONS = {
  [EntityType.Miner]: [ItemType.Coal, ItemType.IronOre],
  [EntityType.Smelter]: [ItemType.IronPlate],
}

export interface Recipe {
  input: {
    type: ItemType
    count: number
  }[]
  speed: Rate
}

export const RECIPES: Partial<Record<ItemType, Recipe>> = {
  [ItemType.IronPlate]: {
    input: [{ type: ItemType.IronOre, count: 1 }],
    speed: new Rate(1, RateType.PerSecond),
  },
}
