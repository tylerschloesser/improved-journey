import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import React from 'react'
import { useCallback } from 'react'
import { Entity, EntityType } from '../entity-types.js'
import { entities$ } from '../game-state.js'

const [useEntities] = bind(entities$)

function Entity({ entity }: { entity: Entity }) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
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
  return Object.values(entities).map((entity) => (
    <Entity key={entity.id} entity={entity} />
  ))
}
