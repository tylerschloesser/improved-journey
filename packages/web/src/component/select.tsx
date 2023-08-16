import { bind } from '@react-rxjs/core'
import { cloneDeep } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { take } from 'rxjs'
import invariant from 'tiny-invariant'
import { EntityId, EntityStateType } from '../entity-types.js'
import {
  chunks$,
  deleteEntities$,
  entities$,
  position$,
  select$,
  world$,
} from '../game-state.js'
import { getCell, getSelectArea } from '../util.js'
import { SimpleVec2, Vec2 } from '../vec2.js'
import { BackButton } from './back-button.js'
import styles from './select.module.scss'

const [useSelect] = bind(select$)
const [useChunks] = bind(chunks$)
const [useEntities] = bind(entities$)

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
      {select.start && select.end && (
        <>
          <DeleteButton select={select} />
          <ForceActiveButton select={select} />
        </>
      )}
    </div>
  )
}

function useSelectedEntityIds(select: { start: Vec2; end: Vec2 }) {
  const chunks = useChunks()
  const area = useMemo(() => getSelectArea(select.start, select.end), [select])

  const entityIds = useMemo(() => {
    const set = new Set<EntityId>()

    for (let x = area.start.x; x <= area.end.x; x++) {
      for (let y = area.start.y; y < area.end.y; y++) {
        const cell = getCell(new Vec2(x, y), chunks)
        if (cell?.entityId) {
          set.add(cell.entityId)
        }
      }
    }

    return set
  }, [chunks, area])

  return entityIds
}

function DeleteButton({ select }: { select: { start: Vec2; end: Vec2 } }) {
  const entityIds = useSelectedEntityIds(select)

  const disabled = entityIds.size === 0

  return (
    <button
      className={styles.button}
      disabled={disabled}
      onPointerUp={() => {
        if (disabled) return
        deleteEntities$.next(entityIds)
      }}
    >
      Delete
      {entityIds.size > 0 && ` (${entityIds.size})`}
    </button>
  )
}

function ForceActiveButton({ select }: { select: { start: Vec2; end: Vec2 } }) {
  const entityIds = useSelectedEntityIds(select)
  const entities = useEntities()

  let disabled = true
  for (const entityId of entityIds) {
    const entity = entities[entityId]
    invariant(entity)
    if (entity.state.type === EntityStateType.Build) {
      disabled = false
      break
    }
  }

  return (
    <button
      className={styles.button}
      disabled={disabled}
      onPointerUp={() => {
        if (disabled) return
        world$.pipe(take(1)).subscribe((world) => {
          world = cloneDeep(world)
          for (const entityId of entityIds) {
            const entity = world.entities[entityId]
            invariant(entity)
            entity.state = { type: EntityStateType.Active }
          }
          world$.next(world)
        })
      }}
    >
      Force Active
    </button>
  )
}
