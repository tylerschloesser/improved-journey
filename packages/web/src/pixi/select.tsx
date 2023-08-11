import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import { map } from 'rxjs'
import { position$, select$ } from '../game-state.js'
import { useDraw } from './use-draw.js'

const [useSelect] = bind(select$)
const [usePosition] = bind(position$.pipe(map((position) => position.floor())))

export function Select() {
  const select = useSelect()
  const position = usePosition()

  const draw = useDraw(
    (g) => {
      g.clear()

      if (select === null) return

      const { x, y } = position
      const lineWidth = 0.1

      g.lineStyle(lineWidth, 'white')
      g.drawRect(
        x + lineWidth / 2,
        y + lineWidth / 2,
        1 - lineWidth,
        1 - lineWidth,
      )
    },
    [select, position],
  )

  return <Graphics draw={draw} />
}
