import { canvas } from './canvas.js'
import { drawRectangle } from './paddle.js'

export type Ball = {
    x: number
    y: number
    vx: number
    vy: number
}

export const ballSize = 10
export const speed = 5

export const ball: Ball = {
  x: canvas.width / 2 - ballSize / 2,
  y: canvas.height / 2 - ballSize / 2,
  vx: speed,
  vy: speed,
}

export function drawBall(): void {
  drawRectangle(ball.x, ball.y, ballSize, ballSize)
}

export function resetBall(): void {
  ball.x = canvas.width / 2 - ballSize / 2
  ball.y = canvas.height / 2 - ballSize / 2
  ball.vx = -ball.vx
  ball.vy = Math.random() < 0.5 ? speed : -speed
}