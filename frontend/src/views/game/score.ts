
export type Score = {
    left: number
    right: number
}

export const score: Score = {
    left: 0,
    right: 0,
}

export function drawScore(ctx: CanvasRenderingContext2D, canvas:HTMLCanvasElement): void {
  if (!ctx) {
    throw new Error('Canvas context is not available')
  }
  ctx.font = '40px Helvetica'
  ctx.fillStyle = 'white'
  ctx.fillText(`SCORE: ${score.left}`, 15, 40)
  ctx.fillText(`SCORE: ${score.right}`, canvas.width - 210, 40)
}