import invariant from 'tiny-invariant'
import { EntityId } from '../entity-types.js'
import { World } from '../types.js'

export type Graph = Map<EntityId, Map<EntityId, { dist: number }>>

function connect(g: Graph, a: EntityId, b: EntityId, dist: number) {
  let value = g.get(a)
  if (!value) {
    value = new Map()
    g.set(a, value)
  }
  // TODO for now we only allow a single connection
  invariant(value.has(b) === false)
  value.set(b, { dist })
}

export function buildGraph(world: World) {
  const graph: Graph = new Map()

  for (const connection of Object.values(world.connections)) {
    const { entityIds } = connection
    const dist = connection.cellIds.length
    connect(graph, entityIds[0], entityIds[1], dist)
    connect(graph, entityIds[1], entityIds[0], dist)
  }

  return graph
}
