import { generateWorld } from './generate-world.js'
import { World } from './types.js'

export async function saveWorld(world: World): Promise<void> {}

export async function loadWorld(): Promise<World> {
  return generateWorld()
}
