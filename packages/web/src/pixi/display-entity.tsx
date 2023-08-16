import { Container, Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import invariant from 'tiny-invariant'
import { DisplayContentType, DisplayEntity } from '../entity-types.js'
import { satisfaction$ } from '../game-state.js'
import { EntityProps } from './entity-props.js'
import { Text } from './text.js'
import { useDraw } from './use-draw.js'

const [useSatisfaction] = bind(satisfaction$)

function Placeholder({ entity, color }: EntityProps<DisplayEntity>) {
  const [x, y] = entity.position
  const [width, height] = entity.size
  const drawBackground = useDraw(
    (g) => {
      g.clear()
      g.beginFill(color)
      g.drawRect(x, y, width, height)
    },
    [entity, color],
  )
  return (
    <>
      <Graphics draw={drawBackground} />
      <Container x={x} y={y} width={width} height={height}>
        <Text text={`Click\nMe...`} size={2} />
      </Container>
    </>
  )
}

function Satisfaction({ entity }: EntityProps<DisplayEntity>) {
  invariant(entity.content?.type === DisplayContentType.Satisfaction)

  const satisfaction = useSatisfaction()

  const [x, y] = entity.position
  const [width, height] = entity.size

  let backgroundColor = '#7EBC89' // green
  if (satisfaction < 0.9) {
    backgroundColor = '#FE5D26' // orange
  }

  const drawBackground = useDraw(
    (g) => {
      g.clear()
      g.beginFill(backgroundColor)
      g.drawRect(x, y, width, height)
    },
    [entity, backgroundColor],
  )

  return (
    <>
      <Graphics draw={drawBackground} />
      <Container x={x} y={y} width={width} height={height}>
        <Text text={`sat\n${Math.trunc(satisfaction * 100)}%`} size={2} />
      </Container>
    </>
  )
}

export function DisplayEntity(props: EntityProps<DisplayEntity>) {
  if (!props.entity.content?.type) {
    return <Placeholder {...props} />
  }
  switch (props.entity.content.type) {
    case DisplayContentType.Satisfaction:
      return <Satisfaction {...props} />
    default:
      throw 'invalid display content type'
  }
}
