import { cloneDeep } from 'lodash-es'
import { world$ } from './game-state.js'
import { EntityType } from './types.js'

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

  const satisfaction = consumption === 0 ? null : production / consumption

  world.tick += 1
  world$.next(world)
}
