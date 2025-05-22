
export type Paddle = {
    x: number
    y: number
}

export const paddleWidth = 10
export const paddleHeight = 100

export let leftPaddle: Paddle = {
  x: 0,
  y: 0,
}

export let rightPaddle: Paddle = {
  x: 0,
  y: 0,
}

export function drawRectangle(ctx:CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string = 'white'): void {
    if (!ctx) {
      throw new Error('Canvas context is not available')
    }
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
}

export function initPaddle(canvas: HTMLCanvasElement): void {
  const centerY = canvas.height / 2 - paddleHeight / 2;
  leftPaddle  = { x: 0, y: centerY };
  rightPaddle = { x: canvas.width - paddleWidth, y: centerY };
}