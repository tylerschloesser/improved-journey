import React from 'react'
import { BackButton } from './back-button.js'

import styles from './debug.module.scss'

export function Debug() {
  return (
    <div className={styles.container}>
      <div className={styles.main}></div>
      <div className={styles.controls}>
        <BackButton className={styles.button} />
      </div>
    </div>
  )
}
