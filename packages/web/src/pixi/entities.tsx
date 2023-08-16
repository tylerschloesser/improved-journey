import { Container, Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import invariant from 'tiny-invariant'
import { ENTITY_CONFIG } from '../entity-config.js'
import { Entity, EntityStateType, EntityType } from '../entity-types.js'
import { entities$ } from '../game-state.js'
import { BeltEntity } from './belt-entity.js'
import { DisplayEntity } from './display-entity.js'
import { EntityProps } from './entity-props.js'
import { LabEntity } from './lab-entity.js'
import { MinerEntity } from './miner-entity.js'
import { SmelterEntity } from './smelter-entity.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

const [useEntities] = bind(entities$)

function PlaceholderEntity({ entity, config }: EntityProps<Entity>) {
  const draw = useDraw(
    (g) => {
      g.clear()

      g.beginFill(config.color)
      const [x, y] = entity.position
      const [width, height] = entity.size
      g.drawRect(x, y, width, height)
    },
    [entity],
  )
  return <Graphics draw={draw} zIndex={ZIndex.entity} />
}

function BuildEntity({ entity, config }: EntityProps<Entity>) {
  const draw = useDraw(
    (g) => {
      g.clear()

      g.beginFill(config.color)
      g.alpha = 0.5
      const [x, y] = entity.position
      const [width, height] = entity.size
      g.drawRect(x, y, width, height)
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

        if (entity.state.type === EntityStateType.Build) {
          return <BuildEntity key={entity.id} entity={entity} config={config} />
        }

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
          case EntityType.Smelter:
            return (
              <SmelterEntity key={entity.id} entity={entity} config={config} />
            )
          case EntityType.Lab:
            return <LabEntity key={entity.id} entity={entity} config={config} />
        }
        return (
          <PlaceholderEntity key={entity.id} entity={entity} config={config} />
        )
      })}
    </Container>
  )
}
