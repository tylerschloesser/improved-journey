import React from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './world-controls.module.scss'

export function WorldControls() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('cursor')
        }}
      >
        Cursor
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('build/miner')
        }}
      >
        Build
      </button>
    </div>
  )
}
