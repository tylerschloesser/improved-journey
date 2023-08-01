import React, { useEffect } from 'react'

import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'
import { buildConnection$, connection$ } from '../game-state.js'
import { bind } from '@react-rxjs/core'

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
          console.log('todo build')
        }}
      >
        Build
      </button>
    </div>
  )
}
