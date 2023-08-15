import { bind } from '@react-rxjs/core'
import { cloneDeep } from 'lodash-es'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { first, map } from 'rxjs'
import { serialize } from 'superjson'
import invariant from 'tiny-invariant'
import { TARGET_OPTIONS } from '../const.js'
import {
  DisplayContentType,
  Entity,
  EntityId,
  EntityType,
} from '../entity-types.js'
import {
  entities$,
  focus$,
  FocusMode,
  setDisplayContentType$,
  setTarget$,
  world$,
} from '../game-state.js'
import { ItemType } from '../item-types.js'
import { BackButton } from './back-button.js'
import styles from './entity.module.scss'
import { useEntityId } from './use-entity-id.js'

const [useEntityOptional] = bind((id: EntityId) =>
  entities$.pipe(map((entities) => entities[id] ?? null)),
)

function useEntity(id: EntityId) {
  const entity = useEntityOptional(id)
  invariant(entity)
  return entity
}

function AddOutputButton({ entityId }: { entityId: EntityId }) {
  const navigate = useNavigate()
  return (
    <button
      className={styles.button}
      onPointerUp={() => {
        focus$.next({
          entityId: entityId,
          mode: FocusMode.Connection,
        })
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
      invariant(miner)
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
          invariant(generator)
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

interface SelectProps<T extends string> {
  placeholder: string
  options: { value: T; label: string }[]
  value: T | null
  onChange(value: T): void
  disabled: boolean
}

function Select<T extends string = string>({
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: SelectProps<T>) {
  // would conflict with placeholder
  invariant(value !== '')

  invariant(options.length > 0)
  if (value !== null) {
    const unique = new Set<T>()
    options.forEach((option) => {
      unique.add(option.value)
    })
    invariant(unique.size === options.length)
    invariant(unique.has(value))
  }

  return (
    <select
      className={styles.select}
      value={value ?? ''}
      onChange={(ev) => {
        onChange(ev.target.value as T)
      }}
      disabled={disabled}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function TargetSelect({ entityId }: { entityId: EntityId }) {
  const entity = useEntity(entityId)
  invariant(
    entity.type === EntityType.Miner || entity.type === EntityType.Smelter,
  )

  const options = TARGET_OPTIONS[entity.type]

  const onChange = useCallback(
    (next: ItemType) => {
      setTarget$.next({ entityId, target: next })
    },
    [entityId],
  )

  return (
    <Select
      options={options.map((value) => ({ value, label: value }))}
      disabled={entity.target !== null}
      value={entity.target}
      onChange={onChange}
      placeholder="Select Target"
    />
  )
}

function DisplayContentTypeSelect({ entityId }: { entityId: EntityId }) {
  const entity = useEntity(entityId)
  invariant(entity.type === EntityType.Display)
  const options = Object.values(DisplayContentType)

  const onChange = useCallback(
    (next: DisplayContentType) => {
      setDisplayContentType$.next({ entityId, type: next })
    },
    [entityId],
  )

  return (
    <Select
      options={options.map((value) => ({ value, label: value }))}
      disabled={entity.content !== null}
      value={entity.content?.type ?? null}
      onChange={onChange}
      placeholder="Select Content"
    />
  )
}

export function Entity() {
  const entityId = useEntityId()
  const entity = useEntityOptional(entityId)
  const navigate = useNavigate()

  useEffect(() => {
    if (entity === null) {
      navigate('..')
    }
  }, [entity])

  useEffect(() => {
    if (entity?.id) {
      focus$.next({ entityId: entity.id, mode: FocusMode.Entity })
    }
  }, [entity?.id])

  const layout = useMemo(() => {
    if (entity === null) return { content: null, controls: null }

    const buttons: JSX.Element[] = []

    buttons.push(<BackButton className={styles.button} />)

    if (
      [EntityType.Miner, EntityType.Belt, EntityType.Smelter].includes(
        entity.type,
      )
    ) {
      buttons.push(<AddOutputButton entityId={entityId} />)
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

    if (entity.type === EntityType.Display) {
      buttons.push(<DisplayContentTypeSelect entityId={entityId} />)
    }

    const content = <DumpJson entityId={entityId} />

    return {
      content,
      controls: buttons
        .map((button) => () => button)
        .map((Wrapper, i) => <Wrapper key={i} />),
    }
  }, [entityId, entity?.type])

  return (
    <div className={styles.container}>
      <div className={styles.content}>{layout.content}</div>
      <div className={styles.controls}>{layout.controls}</div>
    </div>
  )
}
