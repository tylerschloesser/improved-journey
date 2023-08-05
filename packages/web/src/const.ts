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

export const COAL_ENERGY = 1000
export const COAL_BURN_RATE = new Rate(2, RateType.PerTick)
