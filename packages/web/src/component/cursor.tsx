import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cursor$ } from '../game-state.js'

import styles from './cursor.module.scss'

export function Cursor() {
  const navigate = useNavigate()

  useEffect(() => {
    cursor$.next({ enabled: true })
    return () => {
      cursor$.next({ enabled: false })
    }
  }, [])

  return (
    <div className={styles.container}>
      <button
        onPointerUp={() => {
          navigate('..')
        }}
      >
        Back
      </button>
    </div>
  )
}
