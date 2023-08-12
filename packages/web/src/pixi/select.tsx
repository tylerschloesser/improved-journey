import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import { distinctUntilChanged, map } from 'rxjs'
import { position$, select$ } from '../game-state.js'
import { getSelectArea } from '../util.js'
import { Vec2 } from '../vec2.js'
import { useDraw } from './use-draw.js'

const [useSelect] = bind(select$)
const [usePosition] = bind(
  position$.pipe(
    map((position) => position.floor()),
    distinctUntilChanged((a, b) => a.equals(b)),
  ),
)

export function Select() {
  const select = useSelect()
  const position = usePosition()

  const draw = useDraw(
    (g) => {
      g.clear()

      if (select === null) return

      let area: { start: Vec2; end: Vec2 } | null = null

      if (select.start) {
        area = getSelectArea(select.start, select.end ?? position)
      }

      const lineWidth = 0.1
      g.lineStyle(lineWidth, 'white')

      if (area) {
        const size = area.end.sub(area.start)
        const { x, y } = area.start
        g.drawRect(
          x + lineWidth / 2,
          y + lineWidth / 2,
          size.x - lineWidth,
          size.y - lineWidth,
        )
      } else {
        const { x, y } = position
        g.drawRect(
          x + lineWidth / 2,
          y + lineWidth / 2,
          1 - lineWidth,
          1 - lineWidth,
        )
      }
    },
    [select, position],
  )

  return (
    <>
      <Graphics draw={draw} />
    </>
  )
}
