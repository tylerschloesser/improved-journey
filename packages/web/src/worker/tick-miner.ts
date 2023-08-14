import invariant from 'tiny-invariant'
import { MINE_RATE } from '../const.js'
import { EntityType, MinerEntity } from '../entity-types.js'
import { TickEntityFn } from './tick-types.js'

export const tickMiner: TickEntityFn<MinerEntity> = ({
  entity,
  world,
  satisfaction,
  moved,
}) => {
  if (entity.target === null) return

  if (entity.output && entity.connections.output.size > 0) {
    invariant(entity.output.count > 0)

    invariant(entity.connections.output.size === 1)
    const targetEntityId = Array.from(entity.connections.output)[0]
    const target = world.entities[targetEntityId]

    invariant(target)
    invariant(target.type === EntityType.Belt)

    const item = {
      type: entity.output.type,
      progress: 0,
    }
    target.items.push(item)
    entity.output.count -= 1
    if (entity.output.count === 0) {
      entity.output = null
    }
    // make sure we don't also move the new item
    // during the same tick
    moved.add(item)
  }

  entity.progress += MINE_RATE.perTick() * satisfaction
  if (entity.progress >= 1) {
    const count = Math.trunc(entity.progress)
    entity.progress = entity.progress - count

    let output = entity.output
    if (output === null) {
      output = entity.output = { type: entity.target, count: 0 }
    }
    invariant(output.type === entity.target)
    output.count += count
  }
}
