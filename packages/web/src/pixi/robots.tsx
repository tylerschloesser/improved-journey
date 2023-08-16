import { bind } from '@react-rxjs/core'
import { robots$ } from '../game-state.js'
import { Robot } from './robot.js'

const [useRobots] = bind(robots$)

export function Robots() {
  const robots = useRobots()
  return (
    <>
      {robots.map((robot) => (
        <Robot key={robot.id} robot={robot} />
      ))}
    </>
  )
}
