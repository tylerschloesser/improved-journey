import invariant from 'tiny-invariant'
import { CHUNK_SIZE, ENTITY_RECIPES, ROBOT_SPEED, TICK_RATE } from './const.js'
import {
  Entity,
  EntityStateType,
  EntityType,
  StorageEntity,
} from './entity-types.js'
import { ItemType } from './item-types.js'
import { Robot, RobotTaskType, World } from './types.js'
import { SimpleVec2, Vec2 } from './vec2.js'

export interface TickRobotsArgs {
  world: World
  build: Set<Entity>
  storage: Set<StorageEntity>
}

function setTask(robot: Robot, { build, storage }: TickRobotsArgs): void {
  invariant(robot.task === null)

  // TODO handle multiple builds
  if (build.size) {
    const first = Array.from(build).at(0)
    invariant(first)

    invariant(first.state.type === EntityStateType.Build)
    first.state.input

    const recipe = ENTITY_RECIPES[first.type]
    invariant(recipe)

    // TODO this algorithm needs work. It won't handle
    // recipes with multiple ingredients

    let needs: ItemType | null = null
    for (const entry of Object.entries(recipe)) {
      const [itemType, count] = entry as [ItemType, number]
      if ((first.state.input[itemType] ?? 0) < count) {
        needs = itemType
        break
      }
    }
    invariant(needs !== null)

    if (robot.contents?.type === needs) {
      robot.task = {
        id: '0',
        type: RobotTaskType.Deliver,
        target: {
          entityId: first.id,
          position: new Vec2(first.position)
            .add(new Vec2(first.size).div(2))
            .toSimple(),
        },
      }
      return
    }

    for (const entity of storage) {
      if ((entity.items[needs] ?? 0) > 0) {
        robot.task = {
          id: '0',
          type: RobotTaskType.Pickup,
          target: {
            entityId: entity.id,
            position: new Vec2(entity.position)
              .add(new Vec2(entity.size).div(2))
              .toSimple(),
          },
          itemType: needs,
        }
        return
      }
    }
  }

  robot.task = {
    id: '0',
    type: RobotTaskType.Wander,
    target: {
      position: new Vec2(
        Math.random() * CHUNK_SIZE,
        Math.random() * CHUNK_SIZE,
      ).toSimple(),
    },
    waitTicks: 10 /* seconds */ * TICK_RATE,
  }
}

interface MoveToArgs {
  robot: Robot
  target: SimpleVec2
}

function moveTo(args: MoveToArgs): {
  arrived: boolean
} {
  const { robot } = args

  const position = new Vec2(robot.position)
  const target = new Vec2(args.target)

  if (position.equals(target)) {
    return { arrived: true }
  } else {
    const direction = target.sub(position)
    if (direction.len() <= ROBOT_SPEED.perTick()) {
      robot.position = args.target
    } else {
      robot.position = position
        .add(direction.norm().mul(ROBOT_SPEED.perTick()))
        .toSimple()
    }
    return { arrived: false }
  }
}

export function tickRobots(args: TickRobotsArgs): void {
  const { world, build, storage } = args
  for (const robot of Object.values(world.robots)) {
    if (robot.task === null) {
      setTask(robot, args)
    }

    invariant(robot.task)

    switch (robot.task.type) {
      case RobotTaskType.Wander: {
        const { arrived } = moveTo({
          robot,
          target: robot.task.target.position,
        })
        if (arrived) {
          invariant(robot.task.waitTicks > 0)
          robot.task.waitTicks -= 1
          if (robot.task.waitTicks === 0) {
            robot.task = null
          }
        }
        break
      }
      case RobotTaskType.Pickup: {
        const { arrived } = moveTo({
          robot,
          target: robot.task.target.position,
        })
        if (arrived) {
          const entity = world.entities[robot.task.target.entityId]
          invariant(entity)
          invariant(entity.type === EntityType.Storage)

          if ((entity.items[robot.task.itemType] ?? 0) > 0) {
            // TODO now to remove non null assertion?
            entity.items[robot.task.itemType]! -= 1
            invariant(robot.contents === null)
            robot.contents = {
              type: robot.task.itemType,
              count: 1,
            }
          }
          robot.task = null
        }
        break
      }
      case RobotTaskType.Deliver: {
        const { arrived } = moveTo({
          robot,
          target: robot.task.target.position,
        })
        if (arrived) {
          const entity = world.entities[robot.task.target.entityId]
          invariant(entity)
          invariant(entity.state.type === EntityStateType.Build)

          const recipe = ENTITY_RECIPES[entity.type]
          invariant(recipe)

          invariant(robot.contents)
          invariant(robot.contents.count === 1)
          invariant(recipe[robot.contents.type] !== undefined)
          invariant(
            (entity.state.input[robot.contents.type] ?? 0) <
              recipe[robot.contents.type]!,
          )

          entity.state.input[robot.contents.type] =
            (entity.state.input[robot.contents.type] ?? 0) + 1

          robot.contents = null
          robot.task = null
        }
        break
      }
    }
  }
}
