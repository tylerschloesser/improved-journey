import { Container, Graphics } from '@pixi/react'
import * as core from '../types.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

export interface RobotProps {
  robot: core.Robot
}

export function Robot({ robot }: RobotProps) {
  const drawBackground = useDraw((g) => {
    g.clear()
    g.lineStyle(0.1, 'hsl(0, 0%, 80%)')
    g.beginFill('hsl(0, 0%, 30%)')
    g.drawCircle(0, 0, 0.5)
  }, [])

  const [x, y] = robot.position
  const width = 1
  const height = 1

  return (
    <>
      <Container
        x={x}
        y={y}
        width={width}
        height={height}
        zIndex={ZIndex.robot}
      >
        <Graphics draw={drawBackground} />
      </Container>
    </>
  )
}
