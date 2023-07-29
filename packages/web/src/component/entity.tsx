import React from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { EntityId, entities$ } from '../game-state.js'
import { bind } from '@react-rxjs/core'

import styles from './entity.module.scss'
import { map } from 'rxjs'

function useEntityId() {
  const params = useParams<{ id: EntityId }>()
  invariant(params.id)
  return params.id
}

const [useEntity] = bind((id: EntityId) =>
  entities$.pipe(map((entities) => entities[id])),
)

export function Entity() {
  const entityId = useEntityId()
  const entity = useEntity(entityId)

  return (
    <div className={styles.container}>{JSON.stringify(entity, null, 2)}</div>
  )
}
