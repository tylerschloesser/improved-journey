import { CellId } from './game-state.js'
import { Vec2 } from './vec2.js'

// https://www.geeksforgeeks.org/find-two-rectangles-overlap/#
//
// [less|greater] than or equals because we don't consider rectangles
// that touch to be intersecting.
//
export function intersects(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  if (a1.x >= b2.x || a2.x >= b1.x) {
    return false
  }
  if (a1.y >= b2.y || a2.y >= b1.y) {
    return false
  }
  return true
}

export function toCellId(position: Vec2): CellId {
  return `${position.x}.${position.y}`
}
