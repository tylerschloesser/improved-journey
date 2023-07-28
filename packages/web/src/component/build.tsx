import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { combineLatest } from 'rxjs'
import invariant from 'tiny-invariant'
import {
  build$,
  entities$,
  Entity,
  nextEntityId$,
  position$,
} from '../game-state.js'
import { Vec2 } from '../vec2.js'

import styles from './build.module.scss'

function isValid(entity: Entity, entities: Entity[]) {}

export function Build() {
  const navigate = useNavigate()

  const [valid, setValid] = useState(false)

  useEffect(() => {
    const size = new Vec2(2, 2)
    const sub = combineLatest([position$, nextEntityId$, entities$]).subscribe(
      ([position, nextEntityId, entities]) => {
        const buildPosition = position
          .sub(size.sub(new Vec2(1, 1)).div(2))
          .floor()

        let valid = true
        for (const entity of Object.values(entities)) {
        }

        build$.next({
          entity: {
            id: `${nextEntityId}`,
            position: buildPosition,
            size,
          },
          valid,
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
          const entity = build$.value?.entity
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
