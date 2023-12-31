import { bind } from '@react-rxjs/core'
import {
  position$,
  research$,
  robots$,
  satisfaction$,
  tick$,
  worldSize$,
  zoom$,
} from '../game-state.js'
import { BackButton } from './back-button.js'
import styles from './debug.module.scss'

const [useTick] = bind(tick$)
const [usePosition] = bind(position$)
const [useZoom] = bind(zoom$)
const [useSatisfaction] = bind(satisfaction$)
const [useWorldSize] = bind(worldSize$)
const [useResearch] = bind(research$)
const [useRobots] = bind(robots$)

export function Debug() {
  const tick = useTick()
  const position = usePosition()
  const zoom = useZoom()
  const satisfaction = useSatisfaction()
  const worldSize = useWorldSize()
  const research = useResearch()
  const robots = useRobots()

  const rows = [
    { key: 'tick', value: `${tick}` },
    { key: 'position', value: position.toString() },
    { key: 'zoom', value: zoom.toFixed(2) },
    { key: 'satisfaction', value: satisfaction.toFixed(2) },
    {
      key: 'world size',
      value: `${Math.round(
        worldSize / 1024,
      )}KiB (${worldSize.toLocaleString()})`,
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <table>
          <tbody>
            {rows.map(({ key, value }) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <pre className={styles.research}>
          research: {JSON.stringify(research, null, 2)}
        </pre>
        <pre className={styles.research}>
          robots: {JSON.stringify(robots, null, 2)}
        </pre>
      </div>
      <div className={styles.controls}>
        <BackButton className={styles.button} />
      </div>
    </div>
  )
}
