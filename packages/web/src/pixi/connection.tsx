import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import { buildConnection$, nodes$, start$ } from '../connection.js'
import { useDraw } from './use-draw.js'

const [useStart] = bind(start$)
const [useBuild] = bind(buildConnection$)
const [useNodes] = bind(nodes$)

function Nodes() {
  const nodes = useNodes()

  const draw = useDraw(
    (g) => {
      g.clear()
      if (nodes === null) return

      g.beginFill('hsla(180, 50%, 50%, .5)')
      for (const node of nodes.source) {
        const { x, y } = node
        g.drawRect(x, y, 1, 1)
      }

      g.beginFill('hsla(240, 50%, 50%, .2)')
      for (const node of nodes.target) {
        const { x, y } = node
        g.drawRect(x, y, 1, 1)
      }
    },
    [nodes],
  )

  return <Graphics draw={draw} />
}

function Start() {
  const start = useStart()
  const draw = useDraw(
    (g) => {
      g.clear()
      if (start === null) return
      g.beginFill('green')
      const { x, y } = start
      g.drawRect(x, y, 1, 1)
    },
    [start],
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
      <Start />
      <Build />
    </>
  )
}
