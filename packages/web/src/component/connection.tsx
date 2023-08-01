import React, { useEffect } from 'react'

import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'
import {
  buildConnection$,
  connection$,
  entities$,
  nextEntityId$,
} from '../game-state.js'
import { bind } from '@react-rxjs/core'
import invariant from 'tiny-invariant'

const [useBuildConnection] = bind(buildConnection$)

export function Connection() {
  const entityId = useEntityId()
  const build = useBuildConnection()

  const valid = build?.valid ?? false

  useEffect(() => {
    connection$.next({ entityId })
    return () => {
      connection$.next(null)
    }
  }, [])

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        disabled={!valid}
        onPointerUp={() => {
          if (!valid) return
          invariant(build)

          const entities = { ...entities$.value }
          for (const cell of build.cells) {
            entities[cell.entity.id] = cell.entity
          }
          entities$.next(entities)
          nextEntityId$.next(build.nextEntityId)
        }}
      >
        Build
      </button>
    </div>
  )
}
