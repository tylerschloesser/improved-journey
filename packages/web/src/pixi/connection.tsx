import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import React from 'react'
import { combineLatest, map } from 'rxjs'
import { connection$, entities$ } from '../game-state.js'
import { buildConnection$, selected$ } from '../connection.js'
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
const [useBuild] = bind(buildConnection$)

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

function Build() {
  const build = useBuild()
  const draw = useDraw(
    (g) => {
      g.clear()

      if (build === null) return

      for (const cell of build.cells) {
        const color = `hsla(${build.valid ? 100 : 0}, 50%, 50%, .5)`
        g.beginFill(color)
        const { x, y } = cell.entity.position
        g.drawRect(x, y, 1, 1)
      }
    },
    [build],
  )
  return <Graphics draw={draw} />
}

export function Connection() {
  return (
    <>
      <Nodes />
      <Selected />
      <Build />
    </>
  )
}
