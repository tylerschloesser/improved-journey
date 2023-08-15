import * as PIXI from 'pixi.js'
import { BitmapText } from '@pixi/react'

export function installProgressFont() {
  const style = new PIXI.TextStyle({
    fontFamily: '"Lucida Console", Monaco, monospace',
    fill: 'white',
    fontSize: 40,
  })
  PIXI.BitmapFont.from('ProgressFont', style, {
    chars: PIXI.BitmapFont.ASCII,
  })
}

export interface ProgressTextProps {
  progress: number
  color?: 'white' | 'black'
}

export function ProgressText({ progress, color = 'white' }: ProgressTextProps) {
  let tint
  switch (color) {
    case 'white':
      tint = '0xFFFFFF'
      break
    case 'black':
      tint = '0x000000'
      break
  }

  return (
    <BitmapText
      scale={0.01}
      text={`${progress}%`}
      tint={tint}
      style={{ fontName: 'ProgressFont' }}
    />
  )
}
