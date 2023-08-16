import { TICK_RATE } from '../const.js'
import {
  BeltEntity,
  Entity,
  EntityStateType,
  EntityType,
  StorageEntity,
} from '../entity-types.js'
import { RobotTaskType, TickStats, World } from '../types.js'
import { Vec2 } from '../vec2.js'
import { tickBelt } from './tick-belt.js'
import { tickEnergy } from './tick-energy.js'
import { tickLab } from './tick-lab.js'
import { tickMiner } from './tick-miner.js'
import { tickSmelter } from './tick-smelter.js'

export function tickWorld(world: World): TickStats {
  let { satisfaction } = tickEnergy(world)

  const build = new Set<Entity>()
  const storage = new Set<StorageEntity>()

  const stats: TickStats = { satisfaction }

  // clamp satisfaction to 1, because it's used to scale
  // entity work below.
  satisfaction = Math.min(satisfaction, 1)

  // not super elegent, but a simple way to ensure
  // we don't move items twice in one tick
  const moved = new Set<BeltEntity['items'][0]>()

  for (const entity of Object.values(world.entities)) {
    if (entity.state.type === EntityStateType.Build) {
      build.add(entity)
      continue
    }

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
      case EntityType.Storage: {
        storage.add(entity)
        break
      }
    }
  }

  for (const robot of Object.values(world.robots)) {
    if (robot.task === null) {
      robot.task = {
        id: '0',
        type: RobotTaskType.Wander,
        target: {
          position: new Vec2(robot.position)
            .add(new Vec2(1, 0).mul(4))
            .toSimple(),
        },
        waitTicks: 10 /* seconds */ * TICK_RATE,
      }
    }
  }

  world.tick += 1

  return stats
}
