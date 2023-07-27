import React from 'react'

import styles from './world-controls.module.scss'

export function WorldControls() {
  return (
    <div className={styles.container}>
      <button
        onPointerUp={() => {
          console.log('hi')
        }}
      >
        TODO
      </button>
    </div>
  )
}
