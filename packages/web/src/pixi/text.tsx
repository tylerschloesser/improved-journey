import * as PIXI from 'pixi.js'
import { BitmapText } from '@pixi/react'

export const BITMAP_FONT_NAME = 'BitmapFont'

export function installBitmapFont() {
  const style = new PIXI.TextStyle({
    fontFamily: '"Lucida Console", Monaco, monospace',
    fill: 'white',
    fontSize: 100,
  })
  PIXI.BitmapFont.from(BITMAP_FONT_NAME, style, {
    chars: PIXI.BitmapFont.ASCII,
  })
}

export type TextColor = 'white' | 'black'
export type TextSize = 1 | 2

export interface TextProps {
  text: string
  color?: TextColor
  size?: TextSize
}

export function Text({ text, color = 'black', size = 1 }: TextProps) {
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
      scale={0.005 * size}
      text={text}
      tint={tint}
      style={{ fontName: BITMAP_FONT_NAME }}
    />
  )
}
