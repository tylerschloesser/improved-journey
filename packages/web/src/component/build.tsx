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

function isValid(entity: Entity, entities: Entity[]) {
  const a1 = entity.position
  const b1 = entity.position.add(entity.size)

  for (const check of entities) {
    const a2 = check.position
    const b2 = check.position.add(check.size)

    if (a1.x >= b2.x || a2.x >= b1.x) {
      continue
    }

    if (a1.y >= b2.y || a2.y >= b1.y) {
      continue
    }

    return false
  }

  return true
}

export function Build() {
  const navigate = useNavigate()

  const [valid, setValid] = useState(false)

  useEffect(() => {
    const size = new Vec2(2, 2)
    const sub = combineLatest([position$, nextEntityId$, entities$]).subscribe(
      ([position, nextEntityId, entities]) => {
        const entity: Entity = {
          id: `${nextEntityId}`,
          position: position.sub(size.sub(new Vec2(1, 1)).div(2)).floor(),
          size,
        }

        let valid = isValid(entity, Object.values(entities))
        setValid(valid)
        build$.next({ entity, valid })
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
        disabled={!valid}
        onPointerUp={() => {
          if (!valid) return

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
