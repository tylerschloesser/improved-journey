import {
  FastForwardRequest,
  WorkerMessage,
  WorkerMessageType,
  World,
} from './types.js'
import { worker } from './worker.js'

export async function fastForwardWorld(world: World): Promise<World> {
  return new Promise<World>((resolve, _reject) => {
    function listener(ev: MessageEvent<WorkerMessage>): void {
      switch (ev.data.type) {
        case WorkerMessageType.FastForwardResponse:
          worker.removeEventListener('message', listener)
          console.log('fast forwarded', ev.data.ticks, 'ticks')
          resolve(ev.data.world)
          return
      }
    }
    worker.addEventListener('message', listener)

    const request: FastForwardRequest = {
      type: WorkerMessageType.FastForwardRequest,
      world,
    }
    worker.postMessage(request)
  })
}
