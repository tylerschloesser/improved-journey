import { bind } from '@react-rxjs/core'
import { cloneDeep } from 'lodash-es'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { first, map } from 'rxjs'
import invariant from 'tiny-invariant'
import { EntityId, EntityType } from '../entity-types.js'
import { entities$, focus$, FocusMode, world$ } from '../game-state.js'
import { ItemType } from '../item-types.js'
import { BackButton } from './back-button.js'
import styles from './entity.module.scss'
import { useEntityId } from './use-entity-id.js'

const [useEntity] = bind((id: EntityId) =>
  entities$.pipe(map((entities) => entities[id])),
)

function MinerAddOutputButton() {
  const navigate = useNavigate()
  return (
    <button
      className={styles.button}
      onPointerUp={() => {
        navigate('connection')
      }}
    >
      Add Output
    </button>
  )
}

function MinerTestOutputCoalButton({ entityId }: { entityId: EntityId }) {
  return (
    <button
      className={styles.button}
      onPointerUp={() => {
        world$.pipe(first()).subscribe((world) => {
          world = cloneDeep(world)
          const miner = world.entities[entityId]
          invariant(miner.type === EntityType.Miner)
          miner.output = { type: ItemType.Coal, count: 1 }
          world$.next(world)
        })
      }}
    >
      Test Output Coal
    </button>
  )
}

function GeneratorTestBurnCoalButton({ entityId }: { entityId: EntityId }) {
  return (
    <button
      className={styles.button}
      onPointerUp={() => {
        world$.pipe(first()).subscribe((world) => {
          world = cloneDeep(world)
          const generator = world.entities[entityId]
          invariant(generator.type === EntityType.Generator)

          generator.burning = { type: ItemType.Coal, progress: 0 }
          world$.next(world)
        })
      }}
    >
      Test Burn Coal
    </button>
  )
}

function DumpJson({ entityId }: { entityId: EntityId }) {
  const entity = useEntity(entityId)
  return <pre className={styles.json}>{JSON.stringify(entity, null, 2)}</pre>
}

export function Entity() {
  const entityId = useEntityId()
  const entity = useEntity(entityId)

  useEffect(() => {
    focus$.next({ entityId, mode: FocusMode.Entity })
  }, [entityId])

  const buttons: JSX.Element[] = []
  buttons.push(<BackButton className={styles.button} />)

  if ([EntityType.Miner].includes(entity.type)) {
    buttons.push(
      <>
        <MinerAddOutputButton />
        <MinerTestOutputCoalButton entityId={entityId} />
      </>,
    )
  }

  if ([EntityType.Generator].includes(entity.type)) {
    buttons.push(<GeneratorTestBurnCoalButton entityId={entityId} />)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <DumpJson entityId={entityId} />
      </div>
      <div className={styles.controls}>
        {buttons
          .map((button) => () => button)
          .map((Wrapper, i) => (
            <Wrapper key={i} />
          ))}
      </div>
    </div>
  )
}
