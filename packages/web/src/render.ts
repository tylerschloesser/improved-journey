import { gameState } from './game-state.js'

export function render({
  canvas,
  context,
}: {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}) {
  context.clearRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = 'pink'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.translate(gameState.position.x, gameState.position.y)

  context.strokeStyle = 'black'
  context.strokeRect(0, 0, 100, 100)

  context.resetTransform()
}
