import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import React, { useCallback } from 'react'
import { combineLatest, map } from 'rxjs'
import { connection$, entities$ } from '../game-state.js'
import { selected$ } from '../init-connection.js'

const [useConnection] = bind(
  combineLatest([entities$, connection$]).pipe(
    map(([entities, connection]) => {
      if (!connection) return null
      return { entity: entities[connection.entityId] }
    }),
  ),
)

const [useSelected] = bind(selected$)

function Nodes() {
  const connection = useConnection()

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()
      if (connection === null) return

      g.beginFill('hsla(180, 50%, 50%, .5)')
      for (const node of connection.entity.nodes) {
        const { x, y } = node.position
        g.drawRect(x, y, 1, 1)
      }
    },
    [connection],
  )

  return <Graphics draw={draw} />
}

export function Connection() {
  return (
    <>
      <Nodes />
    </>
  )
}
