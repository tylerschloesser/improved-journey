import { parse, stringify } from '../json.js'
import { TickRequest, TickResponse, World } from '../types.js'
import { tickWorld } from './tick.js'

interface MessageData {
  world: World
}

self.onmessage = (message: MessageEvent<MessageData>) => {
  let { world } = parse<TickRequest>(message.data as any)
  const response: TickResponse = tickWorld(world)
  self.postMessage(stringify(response))
}
