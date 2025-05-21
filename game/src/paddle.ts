import { canvas, ctx } from './canvas.js'

export type Paddle = {
    x: number
    y: number
}

export const paddleWidth = 10
export const paddleHeight = 100

export const leftPaddle: Paddle = {
  x: 0,
  y: canvas.height / 2 - paddleHeight / 2,
}

export const rightPaddle: Paddle = {
  x: canvas.width - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
}

export function drawRectangle(x: number, y: number, width: number, height: number, color: string = 'white'): void {
    if (!ctx) {
      throw new Error('Canvas context is not available')
    }
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
  }