import { Text, TextColor } from './text.js'

export interface ProgressTextProps {
  progress: number
  color?: TextColor
}

export function ProgressText({ progress, color }: ProgressTextProps) {
  return <Text text={`${progress}%`} color={color} />
}
