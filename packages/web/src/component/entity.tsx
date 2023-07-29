import { bind } from '@react-rxjs/core'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
