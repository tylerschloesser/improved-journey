import { World } from '../types.js'
import { fixVec2 } from '../util.js'
import { tickWorld } from './tick.js'

interface MessageData {
  world: World
}

self.onmessage = (message: MessageEvent<MessageData>) => {
  let { world } = message.data
  fixVec2(world)
  const response = tickWorld(world)
  self.postMessage(response)
}
