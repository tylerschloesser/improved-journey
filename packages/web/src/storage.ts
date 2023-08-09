import { worldSize$ } from './game-state.js'
import { generateWorld } from './generate-world.js'
import { Client, World } from './types.js'
import { fixVec2 } from './util.js'
import { Vec2 } from './vec2.js'

import superjson from 'superjson'

export async function saveWorld(world: World): Promise<void> {
  const json = superjson.stringify(world)
  worldSize$.next(json.length)
  localStorage.setItem('world', json)
}

export async function loadWorld(): Promise<World> {
  const saved = localStorage.getItem('world')
  if (saved) {
    return fixVec2(superjson.parse(saved))
  }
  return generateWorld()
}

export async function saveClient(client: Client): Promise<void> {
  localStorage.setItem('client', superjson.stringify(client))
}

export async function loadClient(): Promise<Client> {
  const saved = localStorage.getItem('client')
  if (saved) {
    return fixVec2(superjson.parse(saved))
  }
  return {
    position: new Vec2(0),
    zoom: 0.5,
  }
}
