import { Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import { ColorMatrixFilter } from 'pixi.js'
import { useCallback, useMemo } from 'react'
import { ENTITY_CONFIG } from '../entity-config.js'
import { build$ } from '../game-state.js'

const [useBuild] = bind(build$)

function useFilters() {
  return useMemo(() => {
    const filters = {
      valid: new ColorMatrixFilter(),
      invalid: new ColorMatrixFilter(),
    }

    // prettier-ignore
    filters.valid.matrix = [
      0, 0, 0, 0, 0, 
      1, 1, 1, 0, 0, 
      0, 0, 0, 0, 0, 
      0, 0, 0, 1, 0,
    ]
    filters.valid.enabled = false

    // prettier-ignore
    filters.invalid.matrix = [
      1, 1, 1, 0, 0, 
      0, 0, 0, 0, 0, 
      0, 0, 0, 0, 0, 
      0, 0, 0, 1, 0,
    ]
    filters.invalid.enabled = false

    return filters
  }, [])
}

export function Build() {
  const build = useBuild()

  const filters = useFilters()

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear()
      if (!build) return
      const config = ENTITY_CONFIG[build.entity.type]
      g.beginFill(config.color)
      g.drawRect(
        build.entity.position.x,
        build.entity.position.y,
        build.entity.size.x,
        build.entity.size.y,
      )

      filters.valid.enabled = build.valid
      filters.invalid.enabled = !build.valid
    },
    [build],
  )

  return <Graphics draw={draw} filters={[filters.valid, filters.invalid]} />
}
