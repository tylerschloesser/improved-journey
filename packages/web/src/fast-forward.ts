import { World } from './types.js'

export async function fastForwardWorld(world: World): Promise<World> {
  return world
}

// const sub = fromEvent<MessageEvent<WorkerMessage>>(worker, 'message').subscribe(
//      (message) => {
//         invariant(message.data.type === WorkerMessageType.FastForwardResponse)
//       },
// )
