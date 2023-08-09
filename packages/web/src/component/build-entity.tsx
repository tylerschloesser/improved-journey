import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { combineLatest } from 'rxjs'
import invariant from 'tiny-invariant'
import { EntityConfig, ENTITY_CONFIG } from '../entity-config.js'
import { BuildEntity, Entity, EntityType } from '../entity-types.js'
import { addEntities$, build$, entities$, position$ } from '../game-state.js'
import { intersects } from '../util.js'
import { Vec2 } from '../vec2.js'

import styles from './build-entity.module.scss'

function isValid(
  entity: Pick<Entity, 'position' | 'size'>,
  entities: Entity[],
) {
  const a1 = entity.position
  const b1 = entity.position.add(entity.size)

  for (const check of entities) {
    const a2 = check.position
    const b2 = check.position.add(check.size)
    if (intersects(a1, a2, b1, b2)) return false
  }

  return true
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
    const sub = combineLatest([position$, entities$]).subscribe(
      ([position, entities]) => {
        const entity: BuildEntity = config.init({
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
          addEntities$.next({ entities: [entity] })
        }}
      >
        Build
      </button>
    </div>
  )
}
