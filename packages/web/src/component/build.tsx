import React, { useEffect } from 'react'
import { build$ } from '../game-state.js'
import { Vec2 } from '../vec2.js'

export function Build() {
  useEffect(() => {
    build$.next({
      position: new Vec2(0, 0),
    })

    return () => {
      build$.next(null)
    }
  }, [])

  return <>TODO</>
}
