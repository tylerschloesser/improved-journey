import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { build$ } from '../game-state.js'
import { Vec2 } from '../vec2.js'

import styles from './build.module.scss'

export function Build() {
  const navigate = useNavigate()

  useEffect(() => {
    build$.next({
      position: new Vec2(0, 0),
    })

    return () => {
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
