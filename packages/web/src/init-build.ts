import { ColorMatrixFilter, Filter, Graphics } from 'pixi.js'
import { combineLatest } from 'rxjs'
import { build$, cellSize$, worldToScreen$ } from './game-state.js'
import { InitArgs } from './init-args.js'
import { ZIndex } from './z-index.js'

export function initBuild({ app }: InitArgs) {
  let cache: {
    g: Graphics
    invalidFilter: Filter
    validFilter: Filter
  } | null = null

  combineLatest([build$, worldToScreen$, cellSize$]).subscribe(
    ([build, worldToScreen, cellSize]) => {
      if (build === null) {
        if (cache) {
          const { g } = cache
          app.stage.removeChild(g)
          g.destroy()
          cache = null
        }
        return
      }

      if (cache === null) {
        const g = new Graphics()

        g.zIndex = ZIndex.Build

        g.beginFill(build.entity.color)
        g.drawRect(0, 0, 1, 1)

        // https://fecolormatrix.com/

        const validFilter = new ColorMatrixFilter()

        // prettier-ignore
        validFilter.matrix = [
          0, 0, 0, 0, 0, 
          1, 1, 1, 0, 0, 
          0, 0, 0, 0, 0, 
          0, 0, 0, 1, 0,
        ]
        validFilter.enabled = false

        const invalidFilter = new ColorMatrixFilter()

        // prettier-ignore
        invalidFilter.matrix = [
          1, 1, 1, 0, 0, 
          0, 0, 0, 0, 0, 
          0, 0, 0, 0, 0, 
          0, 0, 0, 1, 0,
        ]

        g.filters = [validFilter, invalidFilter]

        app.stage.addChild(g)

        cache = { g, validFilter, invalidFilter }
      }

      const { g, validFilter, invalidFilter } = cache
      validFilter.enabled = build.valid
      invalidFilter.enabled = !build.valid

      const { x, y } = worldToScreen(build.entity.position)

      g.width = cellSize * build.entity.size.x
      g.height = cellSize * build.entity.size.y

      g.position.set(x, y)
    },
  )
}
