import { generateWorld } from './generate-world.js'
import { World } from './types.js'

export async function saveWorld(world: World): Promise<void> {
  localStorage.setItem('world', JSON.stringify(world))
}

export async function loadWorld(): Promise<World> {
  const saved = localStorage.getItem('world')
  if (saved) {
    return JSON.parse(saved)
  }
  return generateWorld()
}