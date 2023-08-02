import { cloneDeep } from 'lodash-es'
import { world$ } from './game-state.js'

export function tickWorld() {
  const world = cloneDeep(world$.value)

  world.tick += 1

  world$.next(world)
}
