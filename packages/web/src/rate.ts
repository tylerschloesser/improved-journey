import { TICK_RATE } from './const.js'

export enum RateType {
  PerSecond,
  PerTick,
}

export class Rate {
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
