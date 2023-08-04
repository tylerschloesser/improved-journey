import { Graphics } from '@pixi/react'
import { useCallback } from 'react'
import { bind } from '@react-rxjs/core'
import * as PIXI from 'pixi.js'
import { connection$ } from '../game-state.js'
import React from 'react'

const [useConnection] = bind(connection$)

export function Connection() {
  const connection = useConnection()
  const draw = useCallback((g: PIXI.Graphics) => {}, [connection])

  return <Graphics draw={draw} />
}
