import { Container, Graphics } from '@pixi/react'
import { bind } from '@react-rxjs/core'
import invariant from 'tiny-invariant'
import { ENTITY_CONFIG } from '../entity-config.js'
import { BeltEntity, Entity, EntityType } from '../entity-types.js'
import { entities$ } from '../game-state.js'
import { DisplayEntity } from './display-entity.js'
import { EntityProps } from './entity-props.js'
import { MinerEntity } from './miner-entity.js'
import { useDraw } from './use-draw.js'
import { ZIndex } from './z-index.js'

const [useEntities] = bind(entities$)

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
