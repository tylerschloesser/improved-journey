import { useEffect } from 'react'

import { bind } from '@react-rxjs/core'
import { distinctUntilChanged, map, take } from 'rxjs'
import invariant from 'tiny-invariant'
import { buildConnection$ } from '../connection.js'
import {
  addEntities$,
  connection$,
  navigate$,
  newEntities$,
} from '../game-state.js'
import { BackButton } from './back-button.js'
import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'
import { EntityType } from '../entity-types.js'

const [useValid] = bind(
  buildConnection$.pipe(
    map((build) => !!build?.valid),
    distinctUntilChanged(),
  ),
)

export function Connection() {
  const entityId = useEntityId()

  const valid = useValid()

  useEffect(() => {
    connection$.next({ entityId })
    return () => {
      connection$.next(null)
    }
  }, [entityId])

  return (
    <div className={styles.container}>
      <BackButton className={styles.button} />
      <button
        className={styles.button}
        disabled={!valid}
        onPointerUp={() => {
          if (!valid) return

          newEntities$.pipe(take(1)).subscribe((entities) => {
            const last = entities.at(-1)
            invariant(last?.type === EntityType.Belt)

            navigate$.next({
              to: `entity/${last.id}/connection`,
            })
          })

          const build = buildConnection$.value
          invariant(build)
          addEntities$.next(build.cells.map((cell) => cell.entity))
        }}
      >
        Build
      </button>
    </div>
  )
}
