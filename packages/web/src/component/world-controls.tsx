import { useNavigate } from 'react-router-dom'

import styles from './world-controls.module.scss'

export function WorldControls() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('debug')
        }}
      >
        Debug
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('build')
        }}
      >
        Build
      </button>
      <button
        className={styles.button}
        onPointerUp={() => {
          navigate('select')
        }}
      >
        Select
      </button>
    </div>
  )
}
