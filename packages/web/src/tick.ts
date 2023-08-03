import { cloneDeep } from 'lodash-es'
import { MINE_RATE, TICK_RATE } from './const.js'
import { EntityType } from './entity-types.js'
import { world$ } from './game-state.js'
import { ItemType } from './item-types.js'

export function tickWorld() {
  const world = cloneDeep(world$.value)

  let consumption = 0
  let production = 0

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Miner:
        consumption += 1
        break
      case EntityType.Generator:
        production += 2
        break
    }
  }

  const satisfaction =
    consumption === 0 ? null : Math.min(production / consumption, 1)

  if (satisfaction !== null) {
    for (const entity of Object.values(world.entities)) {
      switch (entity.type) {
        case EntityType.Miner:
          entity.progress += (MINE_RATE * satisfaction) / TICK_RATE
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
