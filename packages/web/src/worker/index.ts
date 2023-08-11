import { TickRequest, TickResponse } from '../types.js'
import { tickWorld } from './tick.js'

self.onmessage = (message: MessageEvent<TickRequest>) => {
  let { world } = message.data
  const response: TickResponse = tickWorld(world)
  self.postMessage(response)
}
