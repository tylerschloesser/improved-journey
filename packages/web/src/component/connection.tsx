import { useEffect } from 'react'

import { bind } from '@react-rxjs/core'
import { distinctUntilChanged, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { buildConnection$ } from '../connection.js'
import { addEntities$, connection$ } from '../game-state.js'
import { BackButton } from './back-button.js'
import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'

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
  }, [])

  return (
    <div className={styles.container}>
      <BackButton className={styles.button} />
      <button
        className={styles.button}
        disabled={!valid}
        onPointerUp={() => {
          if (!valid) return
          const build = buildConnection$.value
          invariant(build)
          addEntities$.next({
            entities: build.cells.map((cell) => cell.entity),
          })
        }}
      >
        Build
      </button>
    </div>
  )
}
