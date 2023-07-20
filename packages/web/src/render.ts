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
}
