import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { combineLatest } from 'rxjs'
import invariant from 'tiny-invariant'
import { build$, entities$, nextEntityId$, position$ } from '../game-state.js'
import { newMiner } from '../miner.js'
import { Entity, EntityType } from '../types.js'
import { intersects } from '../util.js'
import { Vec2 } from '../vec2.js'

import styles from './build-entity.module.scss'

function isValid(entity: Entity, entities: Entity[]) {
  const a1 = entity.position
  const b1 = entity.position.add(entity.size)

  for (const check of entities) {
    const a2 = check.position
    const b2 = check.position.add(check.size)
    if (intersects(a1, a2, b1, b2)) return false
  }

  return true
}

interface EntityConfig {
  init(args: Omit<Entity, 'type' | 'nodes' | 'color'>): Entity
  size: Vec2
}

const ENTITY_CONFIG: Partial<Record<EntityType, EntityConfig>> = {
  [EntityType.Miner]: {
    init: (args) => newMiner({ ...args, color: 'blue' }),
    size: new Vec2(2, 2),
  },
}

function useEntityConfig(): EntityConfig {
  const params = useParams<{ type: EntityType }>()
  invariant(params.type)
  const config = ENTITY_CONFIG[params.type]
  invariant(config)
  return config
}

export function BuildEntity() {
  const navigate = useNavigate()
  const config = useEntityConfig()

  const [valid, setValid] = useState(false)

  useEffect(() => {
    const { size } = config
    const sub = combineLatest([position$, nextEntityId$, entities$]).subscribe(
      ([position, nextEntityId, entities]) => {
        const entity: Entity = config.init({
          id: `${nextEntityId}`,
          position: position.sub(size.sub(new Vec2(1, 1)).div(2)).floor(),
          size,
        })

        let valid = isValid(entity, Object.values(entities))
        setValid(valid)
        build$.next({ entity, valid })
      },
    )

    return () => {
      sub.unsubscribe()
      build$.next(null)
    }
  }, [])

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
      <button
        className={styles.button}
        disabled={!valid}
        onPointerUp={() => {
          if (!valid) return

          const entity = build$.value?.entity
          invariant(entity)
          const entities = entities$.value
          invariant(entities[entity.id] === undefined)
          entities$.next({
            ...entities,
            [entity.id]: entity,
          })
          nextEntityId$.next(nextEntityId$.value + 1)
        }}
      >
        Build
      </button>
    </div>
  )
}
