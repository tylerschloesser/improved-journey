import invariant from 'tiny-invariant'
import { BuildEntity, Entity, EntityType } from './entity-types.js'
import { World } from './types.js'
import { directionToVec2, getCell, getEntity, setEntityId } from './util.js'
import { Vec2 } from './vec2.js'

export function addEntities(world: World, builds: BuildEntity[]): Entity[] {
  let result: Entity[] = []

  for (let i = 0; i < builds.length; i++) {
    const build = builds[i]

    const entityId = `${world.nextEntityId++}`
    invariant(world.entities[entityId] === undefined)

    let entity: Entity = {
      ...build,
      id: entityId,
    }

    world.entities[entityId] = entity
    result.push(entity)

    for (let x = 0; x < new Vec2(entity.size).x; x++) {
      for (let y = 0; y < new Vec2(entity.size).y; y++) {
        setEntityId({
          position: new Vec2(entity.position).add(new Vec2(x, y)),
          entityId,
          chunks: world.chunks,
        })
      }
    }

    if (
      [EntityType.Miner, EntityType.Generator, EntityType.Smelter].includes(
        entity.type,
      )
    ) {
    }
  }

  for (const entity of result) {
    switch (entity.type) {
      case EntityType.Miner:
      case EntityType.Generator:
      case EntityType.Smelter:
      case EntityType.Storage: {
        const nodes = getNodes(entity)
        const neighbors = nodes
          .map((node) => {
            const cell = getCell(node, world.chunks)
            if (!cell?.entityId) return null
            return world.entities[cell.entityId]
          })
          .filter((neighbor) => neighbor !== null) as Entity[]

        for (const neighbor of neighbors) {
          if (neighbor.type === EntityType.Belt) {
            // TODO only do this if the belt is facing the right direction
            neighbor.connections.output.add(entity.id)
            entity.connections.input.add(neighbor.id)
          }
        }
        break
      }
      case EntityType.Belt: {
        const prev = getEntity(
          new Vec2(entity.position).sub(directionToVec2(entity.direction)),
          world,
        )
        const next = getEntity(
          new Vec2(entity.position).add(directionToVec2(entity.direction)),
          world,
        )

        if (prev) {
          switch (prev.type) {
            case EntityType.Miner:
            case EntityType.Smelter:
            case EntityType.Belt: {
              prev.connections.output.add(entity.id)
              entity.connections.input.add(prev.id)
              break
            }
          }
        }
        if (next) {
          switch (next.type) {
            case EntityType.Smelter:
            case EntityType.Belt:
            case EntityType.Generator:
            case EntityType.Storage: {
              entity.connections.output.add(next.id)
              next.connections.input.add(entity.id)
              break
            }
          }
        }
        break
      }
    }
  }

  invariant(result.length === builds.length)
  return result
}

// TODO move this to util
export function getNodes(entity: Omit<Entity, 'id'>) {
  const size = new Vec2(entity.size)
  const nodes: Vec2[] = []
  for (let x = 0; x < size.x; x++) {
    nodes.push(new Vec2(x, -1))
    nodes.push(new Vec2(x, size.y))
  }
  for (let y = 0; y < size.y; y++) {
    nodes.push(new Vec2(-1, y))
    nodes.push(new Vec2(size.x, y))
  }
  return nodes.map((v) => new Vec2(entity.position).add(v))
}
