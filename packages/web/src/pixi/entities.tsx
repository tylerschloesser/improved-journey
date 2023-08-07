import { Container, Graphics, Text } from '@pixi/react'
import * as PIXI from 'pixi.js'
import { bind } from '@react-rxjs/core'
import React from 'react'
import { DisplayEntity, Entity, EntityType } from '../entity-types.js'
import {
  entities$,
  satisfaction$,
  ZoomLevel,
  zoomLevel$,
} from '../game-state.js'
import { useDraw } from './use-draw.js'

const [useEntities] = bind(entities$)
const [useSatisfaction] = bind(satisfaction$)
const [useZoomLevel] = bind(zoomLevel$)

function DisplayEntity({ entity }: { entity: DisplayEntity }) {
  const satisfaction = useSatisfaction()
  const zoomLevel = useZoomLevel()

  const drawBackground = useDraw(
    (g) => {
      g.clear()

      g.beginFill(entity.color)
      g.drawRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      )
    },
    [entity],
  )

  return (
    <>
      <Graphics draw={drawBackground} />
      <Container
        x={entity.position.x}
        y={entity.position.y}
        width={entity.size.x}
        height={entity.size.y}
        scale={0.01}
        visible={zoomLevel === ZoomLevel.High}
      >
        <Text
          text={`sat\n${satisfaction.toFixed(2)}`}
          style={
            new PIXI.TextStyle({ fill: 'black', align: 'center', fontSize: 40 })
          }
        />
      </Container>
    </>
  )
}

function Entity({ entity }: { entity: Entity }) {
  const draw = useDraw(
    (g) => {
      g.clear()

      g.beginFill(entity.color)
      g.drawRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      )

      switch (entity.type) {
        case EntityType.Belt:
          g.beginFill('black')
          g.lineStyle(0.05, 'gray')
          for (const item of entity.items) {
            g.drawCircle(
              entity.position.x + item.progress,
              entity.position.y + 0.5,
              0.25,
            )
          }
          break
      }
    },
    [entity],
  )
  return <Graphics draw={draw} />
}

export function Entities() {
  const entities = useEntities()
  return Object.values(entities).map((entity) => {
    switch (entity.type) {
      case EntityType.Display:
        return <DisplayEntity key={entity.id} entity={entity} />
    }
    return <Entity key={entity.id} entity={entity} />
  })
}
