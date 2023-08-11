import { bind } from '@react-rxjs/core'
import { useEffect } from 'react'
import { select$ } from '../game-state.js'
import { BackButton } from './back-button.js'
import styles from './select.module.scss'

const [useSelect] = bind(select$)

export function Select() {
  const select = useSelect()

  useEffect(() => {
    select$.next({ start: null, end: null })
    return () => {
      select$.next(null)
    }
  }, [])

  if (select === null) return null

  return (
    <div className={styles.container}>
      <BackButton className={styles.button} />
      {select.start === null && (
        <button className={styles.button}>Start</button>
      )}
    </div>
  )
}
