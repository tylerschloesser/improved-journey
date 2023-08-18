import { TICK_RATE } from './const.js'
import { RobotTaskType, World } from './types.js'
import { Vec2 } from './vec2.js'

export function tickRobots(world: World): void {
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
}
