import {
  FastForwardResponse,
  TickResponse,
  WorkerMessage,
  WorkerMessageType,
} from '../types.js'
import { tickWorld } from './tick.js'

self.onmessage = (message: MessageEvent<WorkerMessage>) => {
  switch (message.data.type) {
    case WorkerMessageType.TickRequest: {
      let { world } = message.data
      const response: TickResponse = tickWorld(world)
      self.postMessage(response)
      return
    }
    case WorkerMessageType.FastForwardRequest: {
      const { world } = message.data
      const response: FastForwardResponse = {
        type: WorkerMessageType.FastForwardResponse,
        ticks: 0,
        world,
      }
      self.postMessage(response)
      return
    }
    default:
      throw `invalid message type: ${message.data.type}`
  }
}
