import {
  DisplayContentType,
  DisplayEntity,
  EntityType,
} from '../entity-types.js'

export function newDisplay(
  args: Omit<DisplayEntity, 'id' | 'type' | 'content'>,
): Omit<DisplayEntity, 'id'> {
  return {
    ...args,
    type: EntityType.Display,
    content: {
      type: DisplayContentType.Satisfaction,
    },
  }
}
