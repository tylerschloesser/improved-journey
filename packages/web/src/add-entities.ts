import invariant from 'tiny-invariant'
import { BuildEntity, Entity, EntityType } from './entity-types.js'
import { World } from './types.js'
import { setEntityId, setNodes } from './util.js'
import { Vec2 } from './vec2.js'

export function addEntities(world: World, builds: BuildEntity[]) {
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

    for (let x = 0; x < entity.size.x; x++) {
      for (let y = 0; y < entity.size.y; y++) {
        setEntityId({
          position: entity.position.add(new Vec2(x, y)),
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
      const nodes = getNodes(entity)
      setNodes({ entity, nodes, world })
    }
  }

  invariant(result.length === builds.length)
}

function getNodes(entity: Omit<Entity, 'id'>) {
  const { size } = entity
  const nodes: Vec2[] = []
  for (let x = 0; x < size.x; x++) {
    nodes.push(new Vec2(x, -1))
    nodes.push(new Vec2(x, size.y))
  }
  for (let y = 0; y < size.y; y++) {
    nodes.push(new Vec2(-1, y))
    nodes.push(new Vec2(size.x, y))
  }
  return nodes.map((v) => entity.position.add(v))
}