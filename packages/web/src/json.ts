import superjson from 'superjson'
import { Vec2 } from './vec2.js'

superjson.registerCustom<Vec2, [number, number]>(
  {
    isApplicable: (v): v is Vec2 => v instanceof Vec2,
    serialize: (v) => [v.x, v.y],
    deserialize: (v) => new Vec2(v[0], v[1]),
  },
  'Vec2',
)

export const stringify = superjson.stringify
export const parse = superjson.parse
