import { bind } from '@react-rxjs/core'
import { cloneDeep } from 'lodash-es'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { first, map } from 'rxjs'
import { serialize } from 'superjson'
import invariant from 'tiny-invariant'
import { TARGET_OPTIONS } from '../const.js'
import { EntityId, EntityType } from '../entity-types.js'
import {
  entities$,
  focus$,
  FocusMode,
  setTarget$,
  world$,
} from '../game-state.js'
import { ItemType } from '../item-types.js'
import { BackButton } from './back-button.js'
import styles from './entity.module.scss'
import { useEntityId } from './use-entity-id.js'

const [useEntity] = bind((id: EntityId) =>
  entities$.pipe(map((entities) => entities[id])),
)

function AddOutputButton() {
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
  const entity = useEntity(entityId)
  invariant(entity.type === EntityType.Miner)

  const hidden = entity.target !== ItemType.Coal

  const onPointerUp = useCallback(() => {
    world$.pipe(first()).subscribe((world) => {
      world = cloneDeep(world)
      const miner = world.entities[entityId]
      invariant(miner.type === EntityType.Miner)
      miner.output = { type: ItemType.Coal, count: 1 }
      world$.next(world)
    })
  }, [])

  if (hidden) return null

  return (
    <button className={styles.button} onPointerUp={onPointerUp}>
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
  return (
    <pre className={styles.json}>
      {JSON.stringify(serialize(entity).json, null, 2)}
    </pre>
  )
}

function TargetSelect({ entityId }: { entityId: EntityId }) {
  const entity = useEntity(entityId)
  invariant(
    entity.type === EntityType.Miner || entity.type === EntityType.Smelter,
  )

  const options = TARGET_OPTIONS[entity.type]

  invariant(entity.target === null || options.includes(entity.target))

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = useCallback(
    (ev) => {
      const target = ev.target.value as ItemType
      setTarget$.next({ entityId, target })
    },
    [entityId],
  )

  return (
    <select
      className={styles.select}
      value={entity.target ?? ''}
      onChange={onChange}
      disabled={entity.target !== null}
    >
      <option value="" disabled>
        Select Target
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export function Entity() {
  const entityId = useEntityId()
  const entity = useEntity(entityId)

  useEffect(() => {
    focus$.next({ entityId, mode: FocusMode.Entity })
  }, [entityId])

  const layout = useMemo(() => {
    const buttons: JSX.Element[] = []
    buttons.push(<BackButton className={styles.button} />)

    if (
      [EntityType.Miner, EntityType.Belt, EntityType.Smelter].includes(
        entity.type,
      )
    ) {
      buttons.push(<AddOutputButton />)
    }

    if ([EntityType.Miner].includes(entity.type)) {
      buttons.push(
        <>
          <MinerTestOutputCoalButton entityId={entityId} />
        </>,
      )
    }

    if ([EntityType.Generator].includes(entity.type)) {
      buttons.push(<GeneratorTestBurnCoalButton entityId={entityId} />)
    }

    if ([EntityType.Miner, EntityType.Smelter].includes(entity.type)) {
      buttons.push(<TargetSelect entityId={entityId} />)
    }

    const content = <DumpJson entityId={entityId} />

    return {
      content,
      controls: buttons
        .map((button) => () => button)
        .map((Wrapper, i) => <Wrapper key={i} />),
    }
  }, [entityId, entity.type])

  return (
    <div className={styles.container}>
      <div className={styles.content}>{layout.content}</div>
      <div className={styles.controls}>{layout.controls}</div>
    </div>
  )
}
