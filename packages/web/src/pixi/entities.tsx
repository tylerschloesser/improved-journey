import { Container, Graphics, Text } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { EntityConfig, ENTITY_CONFIG } from '../entity-config.js'
import {
  BeltEntity,
  DisplayEntity,
  Entity,
  EntityType,
  MinerEntity,
} from '../entity-types.js'
import {
  entities$,
  satisfaction$,
  ZoomLevel,
  zoomLevel$,
} from '../game-state.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

const [useEntities] = bind(entities$)
const [useSatisfaction] = bind(satisfaction$)
const [useZoomLevel] = bind(zoomLevel$)

interface EntityProps<T> {
  entity: T
  config: EntityConfig
}

function MinerEntity({ entity, config }: EntityProps<MinerEntity>) {
  const drawBackground = useDraw(
    (g) => {
      g.clear()

      g.beginFill(config.color)
      g.drawRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      )
    },
    [entity],
  )

  const progress = Math.trunc(entity.progress * 100)

  const textStyle = useMemo(
    () => new PIXI.TextStyle({ fill: 'white', align: 'center', fontSize: 40 }),
    [],
  )

  return (
    <Container zIndex={ZIndex.entity}>
      <Graphics draw={drawBackground} />
      <Container
        x={entity.position.x}
        y={entity.position.y}
        width={entity.size.x}
        height={entity.size.y}
        scale={0.01}
      >
        <Text text={`${progress}%`} style={textStyle} />
      </Container>
    </Container>
  )
}

function DisplayEntity({ entity, config }: EntityProps<DisplayEntity>) {
  const satisfaction = useSatisfaction()
  const zoomLevel = useZoomLevel()

  const drawBackground = useDraw(
    (g) => {
      g.clear()

      g.beginFill(config.color)
      g.drawRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      )
    },
    [entity],
  )

  const textStyle = useMemo(
    () => new PIXI.TextStyle({ fill: 'black', align: 'center', fontSize: 40 }),
    [],
  )

  return (
    <>
      <Graphics draw={drawBackground} />
      <Container
        x={entity.position.x}
        y={entity.position.y}
        width={entity.size.x}
        height={entity.size.y}
        scale={0.01}
        visible={zoomLevel !== ZoomLevel.Low}
      >
        <Text
          text={`sat\n${Math.trunc(satisfaction * 100)}%`}
          style={textStyle}
        />
      </Container>
    </>
  )
}

function BeltEntity({ entity, config }: EntityProps<BeltEntity>) {
  const drawBelt = useDraw(
    (g) => {
      g.clear()
      g.beginFill(config.color)
      g.drawRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      )
    },
    [entity],
  )

  const drawItems = useDraw(
    (g) => {
      g.clear()
      g.beginFill('black')
      g.lineStyle(0.05, 'gray')
      for (const item of entity.items) {
        g.drawCircle(
          entity.position.x + item.progress,
          entity.position.y + 0.5,
          0.25,
        )
      }
    },
    [entity],
  )

  return (
    <>
      <Graphics draw={drawBelt} zIndex={ZIndex.belt} />
      <Graphics draw={drawItems} zIndex={ZIndex.beltItems} />
    </>
  )
}

function Entity({ entity, config }: EntityProps<Entity>) {
  const draw = useDraw(
    (g) => {
      g.clear()

      g.beginFill(config.color)
      g.drawRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      )
    },
    [entity],
  )
  return <Graphics draw={draw} zIndex={ZIndex.entity} />
}

export function Entities() {
  const entities = useEntities()
  return (
    <Container sortableChildren>
      {Object.values(entities).map((entity) => {
        const config = ENTITY_CONFIG[entity.type]
        invariant(config)
        switch (entity.type) {
          case EntityType.Display:
            return (
              <DisplayEntity key={entity.id} entity={entity} config={config} />
            )
          case EntityType.Belt:
            return (
              <BeltEntity key={entity.id} entity={entity} config={config} />
            )
          case EntityType.Miner:
            return (
              <MinerEntity key={entity.id} entity={entity} config={config} />
            )
        }
        return <Entity key={entity.id} entity={entity} config={config} />
      })}
    </Container>
  )
}
