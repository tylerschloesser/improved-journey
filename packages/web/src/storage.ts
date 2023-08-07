import { generateWorld } from './generate-world.js'
import { Client, World } from './types.js'
import { fixVec2 } from './util.js'
import { Vec2 } from './vec2.js'

export async function saveWorld(world: World): Promise<void> {
  localStorage.setItem('world', JSON.stringify(world))
}

export async function loadWorld(): Promise<World> {
  const saved = localStorage.getItem('world')
  if (saved) {
    return fixVec2(JSON.parse(saved))
  }
  return generateWorld()
}

export async function saveClient(client: Client): Promise<void> {
  localStorage.setItem('client', JSON.stringify(client))
}

export async function loadClient(): Promise<Client> {
  const saved = localStorage.getItem('client')
  if (saved) {
    return fixVec2(JSON.parse(saved))
  }
  return {
    position: new Vec2(0),
    zoom: 0.5,
  }
}
