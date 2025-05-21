import { paddleHeight, paddleWidth, leftPaddle, rightPaddle, drawRectangle } from './paddle.js'
import { ballSize, speed, ball, drawBall, resetBall } from './ball.js'
import { score, drawScore } from './score.js'
import { timer, drawTimer, startTimer, resetTimer } from './timer.js'
import { ctx, canvas } from './canvas.js'

let mode: 'local' | 'ai' = 'local'
const epsilon = 0.1

const menu = document.getElementById('menu') as HTMLDivElement
const localBtn = document.getElementById('localBtn') as HTMLButtonElement
const aiBtn = document.getElementById('aiBtn') as HTMLButtonElement

localBtn.onclick = () => {
  mode = 'local'
  startMenuGame()
}

aiBtn.onclick = () => {
  mode = 'ai';
  startMenuGame()
}

const keys: Record<string, boolean> = {}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  keys[e.key] = true
})

document.addEventListener('keyup', (e: KeyboardEvent) => {
  keys[e.key] = false
})

function startGame(): void {
  startTimer(60)
}

function resetGame(): void {
  score.left = 0
  score.right = 0
  resetTimer()
  resetBall()
}

function update(): void {
  if (mode === 'local') {
    if (keys['ArrowUp'] && rightPaddle.y > 0) {
      rightPaddle.y -= speed
    }
    if (keys['ArrowDown'] && rightPaddle.y < canvas.height - paddleHeight) {
      rightPaddle.y += speed
    }
  }
  else if (mode === 'ai') {
    if (ball.y + ballSize / 2 < rightPaddle.y + paddleHeight / 2 && rightPaddle.y > 0)
      rightPaddle.y -= speed
    else if (ball.y + ballSize / 2 > rightPaddle.y + paddleHeight / 2 && rightPaddle.y < canvas.height - paddleHeight)
      rightPaddle.y += speed
  }

  if (keys['w'] && leftPaddle.y > 0) {
    leftPaddle.y -= speed
  }
  if (keys['s'] && leftPaddle.y < canvas.height - paddleHeight) {
    leftPaddle.y += speed
  }

  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.y <= 0 || ball.y >= canvas.height - ballSize) {
    ball.vy = -ball.vy
  }

  if (
    ball.x <= leftPaddle.x + paddleWidth &&
    ball.x + ballSize >= leftPaddle.x &&
    ball.y + ballSize > leftPaddle.y + epsilon &&
    ball.y < leftPaddle.y + paddleHeight - epsilon
  ) {
    ball.x = leftPaddle.x + paddleWidth
    ball.vx = Math.abs(ball.vx)
  }

  if (
    ball.x + ballSize >= rightPaddle.x &&
    ball.x <= rightPaddle.x + paddleWidth &&
    ball.y + ballSize > rightPaddle.y + epsilon &&
    ball.y < rightPaddle.y + paddleHeight - epsilon
  ) {
    ball.x = rightPaddle.x - ballSize;
    ball.vx = -Math.abs(ball.vx)
  }

  if (ball.x < 0 || ball.x > canvas.width) {
    score.left += ball.x < 0 ? 1 : 0
    score.right += ball.x > canvas.width ? 1 : 0
    resetBall()
  }

  if (timer.isRunning) {
    const elapsed = Math.floor((Date.now() - timer.start) / 1000)
    const remaining = Math.max(0, timer.duration - elapsed)
    if (remaining <= 0) {
      timer.isRunning = false
      alert('Time is up! Final Score: Left - ' + score.left + ', Right - ' + score.right)
      menu.style.display = 'block'
      canvas.style.display = 'none'
      resetGame()
      return
    }
  }
}

function render(): void {
  if (!ctx) {
    throw new Error('Canvas context is not available')
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawRectangle(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight)
  drawRectangle(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight)
  drawBall()
  drawScore()
  drawTimer()
}

function gameLoop(): void {
  update()
  render()
  requestAnimationFrame(gameLoop)
}

function startMenuGame() {
  menu.style.display = 'none'
  canvas.style.display = 'block' 
  resetGame() 
  startGame()
  gameLoop()
}