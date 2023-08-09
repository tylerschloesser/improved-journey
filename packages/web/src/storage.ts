import { WORLD_VERSION } from './const.js'
import { worldSize$ } from './game-state.js'
import { generateWorld } from './generate-world.js'
import { parse, stringify } from './json.js'
import { Client, World } from './types.js'
import { Vec2 } from './vec2.js'

export async function saveWorld(world: World): Promise<void> {
  const json = stringify(world)
  worldSize$.next(json.length)
  localStorage.setItem('world', json)
}

export async function loadWorld(): Promise<World> {
  const saved = localStorage.getItem('world')
  if (saved) {
    const world = parse<World>(saved)
    if (world.version === WORLD_VERSION) {
      return world
    }
    console.warn('world version mismatch, re-generating...')
  }
  return generateWorld()
}

export async function saveClient(client: Client): Promise<void> {
  localStorage.setItem('client', stringify(client))
}

export async function loadClient(): Promise<Client> {
  const saved = localStorage.getItem('client')
  if (saved) {
    return parse(saved)
  }
  return {
    position: new Vec2(0).toSimple(),
    zoom: 0.5,
  }
}
