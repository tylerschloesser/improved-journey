import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import React from 'react'
import { useCallback } from 'react'
import { entities$ } from '../game-state.js'

const [useEntities] = bind(entities$)

export function Entities() {
  const entities = useEntities()
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()

      for (const entity of Object.values(entities)) {
        g.beginFill(entity.color)
        g.drawRect(
          entity.position.x,
          entity.position.y,
          entity.size.x,
          entity.size.y,
        )
      }
    },
    [entities],
  )

  return <Graphics draw={draw} />
}
