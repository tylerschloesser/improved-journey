import { bind } from '@react-rxjs/core'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FocusMode, entities$, focus$ } from '../game-state.js'

import { map } from 'rxjs'
import styles from './entity.module.scss'
import { useEntityId } from './use-entity-id.js'
import { EntityId, EntityType } from '../entity-types.js'
import { BackButton } from './back-button.js'

const [useEntity] = bind((id: EntityId) =>
  entities$.pipe(map((entities) => entities[id])),
)

export function Entity() {
  const entityId = useEntityId()
  const entity = useEntity(entityId)

  const navigate = useNavigate()

  useEffect(() => {
    focus$.next({ entityId: entity.id, mode: FocusMode.Entity })
  }, [entityId])

  const buttons: JSX.Element[] = []
  buttons.push(<BackButton className={styles.button} />)

  if ([EntityType.Miner, EntityType.Generator].includes(entity.type)) {
    buttons.push(
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('connection')
        }}
      >
        Add Output
      </button>,
    )
  }

  if ([EntityType.Generator].includes(entity.type)) {
    buttons.push(
      <button
        className={styles.button}
        onPointerUp={() => {
          console.log('todo')
        }}
      >
        Test Burn Coal
      </button>,
    )
  }

  return (
    <div className={styles.container}>
      <pre className={styles.json}>{JSON.stringify(entity, null, 2)}</pre>
      <div className={styles.controls}>
        {buttons
          .map((button) => () => button)
          .map((Wrapper, i) => (
            <Wrapper key={i} />
          ))}
      </div>
    </div>
  )
}
