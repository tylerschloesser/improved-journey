import { bind } from '@react-rxjs/core'
import React from 'react'
import { position$, zoom$ } from '../game-state.js'
import { BackButton } from './back-button.js'

import styles from './debug.module.scss'

const [usePosition] = bind(position$)
const [useZoom] = bind(zoom$)

export function Debug() {
  const position = usePosition()
  const zoom = useZoom()

  const rows = [
    { key: 'position', value: position.toString() },
    { key: 'zoom', value: zoom.toFixed(2) },
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
