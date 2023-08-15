import * as PIXI from 'pixi.js'
import { BitmapText } from '@pixi/react'

export const BITMAP_FONT_NAME = 'BitmapFont'

export function installBitmapFont() {
  const style = new PIXI.TextStyle({
    fontFamily: '"Lucida Console", Monaco, monospace',
    fill: 'white',
    fontSize: 40,
  })
  PIXI.BitmapFont.from(BITMAP_FONT_NAME, style, {
    chars: PIXI.BitmapFont.ASCII,
  })
}

export type TextColor = 'white' | 'black'

export interface TextProps {
  text: string
  color?: TextColor
}

export function Text({ text, color = 'black' }: TextProps) {
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
      text={text}
      tint={tint}
      style={{ fontName: BITMAP_FONT_NAME }}
    />
  )
}
