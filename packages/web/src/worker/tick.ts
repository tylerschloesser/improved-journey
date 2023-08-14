import invariant from 'tiny-invariant'
import { MINE_RATE } from '../const.js'
import {
  BeltEntity,
  EntityType,
  LabEntity,
  MinerEntity,
} from '../entity-types.js'
import { TickStats, World } from '../types.js'
import { tickBelt } from './tick-belt.js'
import { tickEnergy } from './tick-energy.js'
import { tickSmelter } from './tick-smelter.js'
import { TickEntityFn } from './tick-types.js'

const tickMiner: TickEntityFn<MinerEntity> = ({
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

export const tickLab: TickEntityFn<LabEntity> = ({
  entity,
  world,
  satisfaction,
  moved,
}) => {}

export function tickWorld(world: World): TickStats {
  let { satisfaction } = tickEnergy(world)

  const stats: TickStats = { satisfaction }

  // clamp satisfaction to 1, because it's used to scale
  // entity work below.
  satisfaction = Math.min(satisfaction, 1)

  // not super elegent, but a simple way to ensure
  // we don't move items twice in one tick
  const moved = new Set<BeltEntity['items'][0]>()

  for (const entity of Object.values(world.entities)) {
    switch (entity.type) {
      case EntityType.Miner: {
        tickMiner({ entity, world, satisfaction, moved })
        break
      }
      case EntityType.Belt: {
        tickBelt({ entity, world, satisfaction, moved })
        break
      }
      case EntityType.Smelter: {
        tickSmelter({ entity, world, satisfaction, moved })
        break
      }
      case EntityType.Lab: {
        tickLab({ entity, world, satisfaction, moved })
        break
      }
    }
  }

  world.tick += 1

  return stats
}
