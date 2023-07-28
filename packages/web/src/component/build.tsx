import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { combineLatest } from 'rxjs'
import invariant from 'tiny-invariant'
import { build$, entities$, nextEntityId$, position$ } from '../game-state.js'
import { Vec2 } from '../vec2.js'

import styles from './build.module.scss'

export function Build() {
  const navigate = useNavigate()

  useEffect(() => {
    const size = new Vec2(2, 2)
    const sub = combineLatest([position$, nextEntityId$]).subscribe(
      ([position, nextEntityId]) => {
        build$.next({
          id: `${nextEntityId}`,
          position: position.sub(size.sub(new Vec2(1, 1)).div(2)).floor(),
          size,
        })
      },
    )

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
      <button
        onPointerUp={() => {
          const entity = build$.value
          invariant(entity)
          const entities = entities$.value
          invariant(entities[entity.id] === undefined)
          entities$.next({
            ...entities,
            [entity.id]: entity,
          })
          nextEntityId$.next(nextEntityId$.value + 1)
        }}
      >
        Build
      </button>
    </div>
  )
}
