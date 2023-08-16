import { Container, Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import { LabEntity } from '../entity-types.js'
import { research$ } from '../game-state.js'
import { ItemType } from '../item-types.js'
import { Vec2 } from '../vec2.js'
import { drawItem } from './draw-item.js'
import { EntityProps } from './entity-props.js'
import { ProgressText } from './ProgressText.js'
import { Text } from './text.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

const [useResearch] = bind(research$)

interface ResearchProps {
  target: ItemType | null
}

function Research({ target }: ResearchProps) {
  const research = useResearch()
  if (target === null) return null
  const value = research[target] ?? 0
  return <Text text={`r: ${value.toLocaleString()}`} />
}

export function LabEntity({ entity, color }: EntityProps<LabEntity>) {
  const [x, y] = entity.position
  const [width, height] = entity.size

  const drawBackground = useDraw(
    (g) => {
      g.clear()
      g.beginFill(color)
      g.drawRect(x, y, width, height)
    },
    [entity],
  )

  const drawTarget = useDraw(
    (g) => {
      g.clear()
      if (entity.target === null) return
      drawItem({
        itemType: entity.target,
        g,
        position: new Vec2(entity.position).add(new Vec2(2.5, 0.5)),
      })
    },
    [entity],
  )

  let progress = null
  if (entity.progress !== null) {
    progress = Math.trunc(entity.progress * 100)
  }

  return (
    <Container zIndex={ZIndex.entity}>
      <Graphics draw={drawBackground} />
      <Container x={x} y={y} width={width} height={height}>
        {progress !== null && (
          <ProgressText progress={progress} color="black" />
        )}
      </Container>
      <Graphics draw={drawTarget} />
      <Container x={x} y={y + 2} width={width} height={1}>
        <Research target={entity.target} />
      </Container>
    </Container>
  )
}
