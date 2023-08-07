import { bind } from '@react-rxjs/core'
import React from 'react'
import { position$, satisfaction$, tick$, zoom$ } from '../game-state.js'
import { BackButton } from './back-button.js'

import styles from './debug.module.scss'

const [useTick] = bind(tick$)
const [usePosition] = bind(position$)
const [useZoom] = bind(zoom$)
const [useSatisfaction] = bind(satisfaction$)

export function Debug() {
  const tick = useTick()
  const position = usePosition()
  const zoom = useZoom()
  const satisfaction = useSatisfaction()

  const rows = [
    { key: 'tick', value: `${tick}` },
    { key: 'position', value: position.toString() },
    { key: 'zoom', value: zoom.toFixed(2) },
    { key: 'satisfaction', value: satisfaction.toFixed(2) },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <table>
          <tbody>
            {rows.map(({ key, value }) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.controls}>
        <BackButton className={styles.button} />
      </div>
    </div>
  )
}
