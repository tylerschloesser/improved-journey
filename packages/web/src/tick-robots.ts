import invariant from 'tiny-invariant'
import { CHUNK_SIZE, ROBOT_SPEED, TICK_RATE } from './const.js'
import { RobotTaskType, World } from './types.js'
import { Vec2 } from './vec2.js'

export function tickRobots(world: World): void {
  for (const robot of Object.values(world.robots)) {
    if (robot.task === null) {
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

    switch (robot.task.type) {
      case RobotTaskType.Wander: {
        const position = new Vec2(robot.position)
        const target = new Vec2(robot.task.target.position)

        if (position.equals(target)) {
          invariant(robot.task.waitTicks > 0)

          robot.task.waitTicks -= 1
          if (robot.task.waitTicks === 0) {
            robot.task = null
          }
        } else {
          const direction = target.sub(position)
          if (direction.len() <= ROBOT_SPEED.perTick()) {
            robot.position = robot.task.target.position
          } else {
            robot.position = position
              .add(direction.norm().mul(ROBOT_SPEED.perTick()))
              .toSimple()
          }
        }
      }
    }
  }
}
