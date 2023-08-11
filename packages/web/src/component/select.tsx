import { BackButton } from './back-button.js'
import styles from './select.module.scss'

export function Select() {
  return (
    <div className={styles.container}>
      <BackButton className={styles.button} />
    </div>
  )
}
