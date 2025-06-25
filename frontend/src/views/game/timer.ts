
export type Timer = {
    start: number
    duration: number
    isRunning: boolean
}

export const timer: Timer = {
    start: 0,
    duration: 0,
    isRunning: false,
}

export function drawTimer(ctx: CanvasRenderingContext2D, canvas:HTMLCanvasElement): void {
  if (!ctx) {
    throw new Error('Canvas context is not available')
  }
  const elapsed = Math.floor((Date.now() - timer.start) / 1000)
  const remaining = Math.max(0, timer.duration - elapsed)
  ctx.font = '20px Helvetica'
  ctx.fillStyle = 'white'
  ctx.fillText(`TIME: ${remaining}`, canvas.width / 2 - 50, 20)
}

export function startTimer(duration: number): void {
  timer.start = Date.now()
  timer.duration = duration
  if (timer.duration < 10) {
    timer.duration = 10
  }
  if (timer.duration > 300) {
    timer.duration = 300
  }
  timer.isRunning = true
}

export function resetTimer(): void {
  timer.start = 0
  timer.duration = 0
  timer.isRunning = false
}