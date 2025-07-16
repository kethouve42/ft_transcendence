import { drawRectangle } from './paddle.js'

export type Ball = {
    x: number
    y: number
    vx: number
    vy: number
}

export const ballSize = 10
export let speed = 5

export const ball: Ball = {
  x: 0,
  y: 0,
  vx: speed,
  vy: speed,
}

export function drawBall(ctx: CanvasRenderingContext2D): void {
  drawRectangle(ctx, ball.x, ball.y, ballSize, ballSize)
}

export function resetBall(canvas: HTMLCanvasElement): void {
  ball.x = canvas.width / 2 - ballSize / 2
  ball.y = canvas.height / 2 - ballSize / 2

//------------------------------OLD-----------------------------------//
  //ball.vx = -ball.vx
  //ball.vy = Math.random() < 0.5 ? speed : -speed
//--------------------------------------------------------------------//
//-----------------------------NOUVEAU CALCUL DE LA BALLE-------------------------------//
  // Angle aléatoire entre -30° et +30° (en radians), direction gauche ou droite
  const angle = (Math.random() * Math.PI / 3) - (Math.PI / 6)
  const direction = Math.random() < 0.5 ? 1 : -1
  ball.vx = Math.cos(angle) * speed * direction
  ball.vy = Math.sin(angle) * speed
//--------------------------------------------------------------------------------------//
}