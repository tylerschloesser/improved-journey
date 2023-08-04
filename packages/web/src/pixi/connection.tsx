import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import React from 'react'
import { combineLatest, map } from 'rxjs'
import { connection$, entities$ } from '../game-state.js'
import { selected$ } from '../init-connection.js'
import { useDraw } from './use-draw.js'

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

  const draw = useDraw(
    (g) => {
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

function Selected() {
  const selected = useSelected()
  const draw = useDraw(
    (g) => {
      g.clear()
      if (selected === null) return
      g.beginFill('green')
      const { x, y } = selected.node.position
      g.drawRect(x, y, 1, 1)
    },
    [selected],
  )
  return <Graphics draw={draw} />
}

export function Connection() {
  return (
    <>
      <Nodes />
      <Selected />
    </>
  )
}
