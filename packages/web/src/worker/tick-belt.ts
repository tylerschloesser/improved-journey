import invariant from 'tiny-invariant'
import { BELT_SPEED } from '../const.js'
import {
  BeltEntity,
  Entity,
  EntityStateType,
  EntityType,
} from '../entity-types.js'
import { TickEntityFn } from './tick-types.js'

export const tickBelt: TickEntityFn<BeltEntity> = ({
  entity,
  world,
  satisfaction,
  moved,
}) => {
  const remove = new Set<(typeof entity.items)[0]>()
  for (const item of entity.items) {
    // check if the item was just moved onto this belt
    if (moved.has(item)) continue

    item.progress += BELT_SPEED.perTick() * satisfaction
    if (item.progress >= 1) {
      let next: Entity | null = null
      if (entity.connections.output.size > 0) {
        invariant(entity.connections.output.size === 1)
        const first = Array.from(entity.connections.output)[0]
        invariant(first)
        next = world.entities[first] ?? null
        invariant(next)
      }

      if (next === null || next.state.type !== EntityStateType.Active) {
        item.progress = 1
      } else {
        remove.add(item)
        switch (next.type) {
          case EntityType.Belt: {
            moved.add(item)
            next.items.push(item)
            item.progress -= 1
            break
          }
          case EntityType.Generator: {
            let fuel = next.fuel
            if (!fuel) {
              fuel = next.fuel = { type: item.type, count: 0 }
            }
            invariant(fuel.type === item.type)
            fuel.count += 1
            break
          }
          case EntityType.Smelter: {
            let input = next.input
            if (!input) {
              input = next.input = { type: item.type, count: 0 }
            }
            invariant(input.type === item.type)
            input.count += 1
            break
          }
          case EntityType.Storage: {
            next.items[item.type] = (next.items[item.type] ?? 0) + 1
            break
          }
          case EntityType.Lab: {
            let input = next.input
            if (!input) {
              input = next.input = { type: item.type, count: 0 }
            }
            invariant(input.type === item.type)
            input.count += 1
            break
          }
        }
      }
    }
  }
  if (remove.size) {
    entity.items = entity.items.filter((item) => !remove.has(item))
  }
}
