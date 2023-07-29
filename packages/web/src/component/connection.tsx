import React, { useEffect } from 'react'

import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'
import { connection$ } from '../game-state.js'

export function Connection() {
  const entityId = useEntityId()

  useEffect(() => {
    connection$.next({ entityId })
    return () => {
      connection$.next(null)
    }
  }, [])

  return <div className={styles.container}>TODO</div>
}
