import React from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { EntityId } from '../game-state.js'

import styles from './entity.module.scss'

function useEntityId() {
  const params = useParams<{ id: EntityId }>()
  invariant(params.id)
  return params.id
}

export function Entity() {
  const entityId = useEntityId()

  return <div className={styles.container}>TODO: ${entityId}</div>
}
