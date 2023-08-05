import { World } from '../types.js'
import { fixWorld } from '../util.js'
import { tickWorld } from './tick.js'

interface MessageData {
  world: World
}

self.onmessage = (message: MessageEvent<MessageData>) => {
  let { world } = message.data
  fixWorld(world)
  world = tickWorld(world)
  self.postMessage({ world })
}
