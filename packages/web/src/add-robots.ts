import invariant from 'tiny-invariant'
import { EntityType } from './entity-types.js'
import { Robot, World } from './types.js'
import { Vec2 } from './vec2.js'

export function addRobots(world: World, robots: Robot[]) {
  for (const robot of robots) {
    invariant(world.robots[robot.id] === undefined)

    world.robots[robot.id] = robot

    if (robot.stationId) {
      const station = world.entities[robot.stationId]
      invariant(station)
      invariant(station.type === EntityType.RobotStation)

      robot.position = new Vec2(station.position)
        .add(new Vec2(station.size).div(2))
        .toSimple()

      station.robotIds.add(robot.id)
    }
  }
}
