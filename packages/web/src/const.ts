import { EntityType } from './entity-types.js'
import { ItemType } from './item-types.js'
import { Rate, RateType } from './rate.js'

export const WORLD_VERSION = 4

export const MAX_CELL_SIZE = 32
export const MIN_CELL_SIZE = 4

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
export const LAB_CONSUMPTION = new Rate(5, RateType.PerTick)

// how long does it take for an item to move across a belt
export const BELT_SPEED = new Rate(1, RateType.PerSecond)

export const RESEARCH_SPEED = new Rate(1 / 5, RateType.PerSecond)

export const TARGET_OPTIONS = {
  [EntityType.Miner]: [ItemType.Coal, ItemType.IronOre, ItemType.CopperOre],
  [EntityType.Smelter]: [ItemType.IronPlate, ItemType.CopperPlate],
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
  [ItemType.CopperPlate]: {
    input: [{ type: ItemType.CopperOre, count: 1 }],
    speed: new Rate(1, RateType.PerSecond),
  },
}

export type EntityRecipe = Partial<Record<ItemType, number>>

export const ENTITY_RECIPES: Partial<Record<EntityType, EntityRecipe>> = {
  [EntityType.Miner]: {
    [ItemType.IronPlate]: 100,
  },
}
