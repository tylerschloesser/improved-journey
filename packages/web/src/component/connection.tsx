import React, { useEffect } from 'react'

import { bind } from '@react-rxjs/core'
import invariant from 'tiny-invariant'
import { addEntities, connection$, world$ } from '../game-state.js'
import styles from './connection.module.scss'
import { useEntityId } from './use-entity-id.js'
import { cloneDeep } from 'lodash-es'
import { buildConnection$ } from '../connection.js'
import { BackButton } from './back-button.js'

const [useBuildConnection] = bind(buildConnection$)

export function Connection() {
  const entityId = useEntityId()
  const build = useBuildConnection()

  const valid = build?.valid ?? false

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
          invariant(build)

          const world = cloneDeep(world$.value)
          addEntities(
            world,
            build.cells.map((cell) => cell.entity),
          )
          world$.next(world)
        }}
      >
        Build
      </button>
    </div>
  )
}
