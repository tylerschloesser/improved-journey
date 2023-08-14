import invariant from 'tiny-invariant'
import { EntityId } from './entity-types.js'
import { World } from './types.js'
import { getCell } from './util.js'
import { Vec2 } from './vec2.js'

export function deleteEntities(world: World, entityIds: Set<EntityId>): void {
  for (const entityId of entityIds) {
    const entity = world.entities[entityId]
    invariant(entity)

    const size = new Vec2(entity.size)
    const position = new Vec2(entity.position)

    for (let x = 0; x < size.x; x++) {
      for (let y = 0; y < size.y; y++) {
        const cell = getCell(position.add(new Vec2(x, y)), world.chunks)
        invariant(cell)
        // TODO could set cell itself to null here...
        cell.entityId = null
      }
    }

    for (const peerEntityId of entity.connections.input) {
      const peer = world.entities[peerEntityId]
      invariant(peer)
      invariant(peer.connections.output.has(entityId))
      peer.connections.output.delete(entityId)
    }

    for (const peerEntityId of entity.connections.output) {
      const peer = world.entities[peerEntityId]
      invariant(peer)
      invariant(peer.connections.input.has(entityId))
      peer.connections.input.delete(entityId)
    }

    delete world.entities[entityId]
  }
}
