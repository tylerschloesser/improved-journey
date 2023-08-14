import invariant from 'tiny-invariant'
import { Recipe, RECIPES, SMELTER_CONSUMPTION } from '../const.js'
import { SmelterEntity } from '../entity-types.js'

export interface SmelterState {
  consumption: number
  recipe: Recipe | null
  ready: number
}

export function getSmelterState(smelter: SmelterEntity): SmelterState {
  let state: SmelterState = {
    consumption: 0,
    recipe: null,
    ready: 0,
  }
  if (smelter.target === null) return state

  state.recipe = RECIPES[smelter.target] ?? null

  invariant(state.recipe !== null)
  invariant(state.recipe.input.length === 1)

  if (smelter.input && smelter.input.type === state.recipe.input[0].type) {
    state.ready = Math.floor(smelter.input.count / state.recipe.input[0].count)
  }

  if (state.ready || smelter.progress) {
    state.consumption = SMELTER_CONSUMPTION.perTick()
  }

  return state
}
