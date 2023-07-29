import React, { useEffect } from 'react'

import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'

export function Connection() {
  const entityId = useEntityId()

  useEffect(() => {
    console.log(entityId)
  }, [])

  return <div className={styles.container}>TODO</div>
}
