import React, { useEffect } from 'react'

import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'
import { connection$, connectionValid$ } from '../game-state.js'
import { bind } from '@react-rxjs/core'

const [useConnectionValid] = bind(connectionValid$)

export function Connection() {
  const entityId = useEntityId()
  const valid = useConnectionValid()

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
