import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import { map } from 'rxjs'
import { position$, select$ } from '../game-state.js'
import { Vec2 } from '../vec2.js'
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

      let area: { start: Vec2; end: Vec2 } | null = null

      if (select.start) {
        area = {
          start: new Vec2(
            Math.min(position.x, select.start.x),
            Math.min(position.y, select.start.y),
          ),
          end: new Vec2(
            Math.max(position.x, select.start.x),
            Math.max(position.y, select.start.y),
          ),
        }
      }

      const lineWidth = 0.1
      g.lineStyle(lineWidth, 'white')

      if (area) {
        const size = area.end.sub(area.start)
        const { x, y } = position
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
