import { bind } from '@react-rxjs/core'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { EntityId, entities$ } from '../game-state.js'

import { map } from 'rxjs'
import styles from './entity.module.scss'
import { useEntityId } from './use-entity-id.js'

const [useEntity] = bind((id: EntityId) =>
  entities$.pipe(map((entities) => entities[id])),
)

export function Entity() {
  const entityId = useEntityId()
  const entity = useEntity(entityId)

  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('connection')
        }}
      >
        Add Output
      </button>
      <pre>{JSON.stringify(entity, null, 2)}</pre>
    </div>
  )
}