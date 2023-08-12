import { bind } from '@react-rxjs/core'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { take } from 'rxjs'
import { chunks$, position$, select$ } from '../game-state.js'
import { SimpleVec2, Vec2 } from '../vec2.js'
import { BackButton } from './back-button.js'
import styles from './select.module.scss'

const [useSelect] = bind(select$)
const [useChunks] = bind(chunks$)

export function Select() {
  const select = useSelect()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    let start: Vec2 | null = null
    let end: Vec2 | null = null
    if (searchParams.get('start')) {
      start = new Vec2(JSON.parse(searchParams.get('start')!) as SimpleVec2)
    }
    if (searchParams.get('end')) {
      end = new Vec2(JSON.parse(searchParams.get('end')!) as SimpleVec2)
    }
    select$.next({ start: start!, end })
    return () => {
      select$.next(null)
    }
  }, [searchParams])

  if (select === null) return null

  return (
    <div className={styles.container}>
      <BackButton className={styles.button} />
      {select.start === null && (
        <button
          className={styles.button}
          onPointerUp={() => {
            position$.pipe(take(1)).subscribe((position) => {
              setSearchParams({
                start: JSON.stringify(position.floor().toSimple()),
              })
            })
          }}
        >
          Start
        </button>
      )}
      {select.start !== null && select.end === null && (
        <button
          className={styles.button}
          onPointerUp={() => {
            position$.pipe(take(1)).subscribe((position) => {
              setSearchParams((prev) => {
                prev.append('end', JSON.stringify(position.floor().toSimple()))
                return prev
              })
            })
          }}
        >
          End
        </button>
      )}
      {select.start && select.end && <DeleteButton select={select as any} />}
    </div>
  )
}

function DeleteButton({ select }: { select: { start: Vec2; end: Vec2 } }) {
  const chunks = useChunks()

  return <button className={styles.button}>Delete</button>
}
