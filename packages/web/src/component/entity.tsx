import { bind } from '@react-rxjs/core'
import React from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'
import { EntityId, entities$ } from '../game-state.js'

import { map } from 'rxjs'
import styles from './entity.module.scss'

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
    <div className={styles.container}>
      <button className={styles.button}>Add Output</button>
      <pre>{JSON.stringify(entity, null, 2)}</pre>
    </div>
  )
}
