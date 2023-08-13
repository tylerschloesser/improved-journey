import invariant from 'tiny-invariant'
import { TickResponse, WorkerMessage, WorkerMessageType } from '../types.js'
import { tickWorld } from './tick.js'

self.onmessage = (message: MessageEvent<WorkerMessage>) => {
  invariant(message.data.type === WorkerMessageType.TickRequest)
  let { world } = message.data
  const response: TickResponse = tickWorld(world)
  self.postMessage(response)
}
