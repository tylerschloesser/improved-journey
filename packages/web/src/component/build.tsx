import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { build$, position$ } from '../game-state.js'
import { Vec2 } from '../vec2.js'

import styles from './build.module.scss'

export function Build() {
  const navigate = useNavigate()

  useEffect(() => {
    const size = new Vec2(2, 2)

    const sub = position$.subscribe((position) => {
      build$.next({
        position: position.sub(size.div(2)).floor(),
      })
      console.log(position, build$.value?.position)
    })

    return () => {
      sub.unsubscribe()
      build$.next(null)
    }
  }, [])

  return (
    <div className={styles.container}>
      <button
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
    </div>
  )
}
