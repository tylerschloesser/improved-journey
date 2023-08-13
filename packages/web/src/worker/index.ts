import {
  FastForwardResponse,
  TickResponse,
  WorkerMessage,
  WorkerMessageType,
} from '../types.js'
import { fastForwardWorld } from './fast-forward.js'
import { tickWorld } from './tick.js'

self.onmessage = (message: MessageEvent<WorkerMessage>) => {
  switch (message.data.type) {
    case WorkerMessageType.TickRequest: {
      let { world } = message.data
      const stats = tickWorld(world)
      const response: TickResponse = {
        type: WorkerMessageType.TickResponse,
        world,
        stats,
      }
      self.postMessage(response)
      return
    }
    case WorkerMessageType.FastForwardRequest: {
      const { world, ticks } = fastForwardWorld(message.data.world)
      const response: FastForwardResponse = {
        type: WorkerMessageType.FastForwardResponse,
        ticks,
        world,
      }
      self.postMessage(response)
      return
    }
    default:
      throw `invalid message type: ${message.data.type}`
  }
}
