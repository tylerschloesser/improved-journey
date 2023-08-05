import React from 'react'
import { useNavigate } from 'react-router-dom'
import { EntityType } from '../entity-types.js'
import { BackButton } from './back-button.js'

import styles from './build.module.scss'

export function Build() {
  const navigate = useNavigate()
  return (
    <div className={styles.container}>
      <div>
        {Object.values(EntityType).map((type) => (
          <button
            className={styles.button}
            key={type}
            onPointerUp={() => {
              navigate(type)
            }}
          >
            {type}
          </button>
        ))}
      </div>
      <BackButton className={styles.button} />
    </div>
  )
}
