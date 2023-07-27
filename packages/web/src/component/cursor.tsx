import React from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './cursor.module.scss'

export function Cursor() {
  const navigate = useNavigate()
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
