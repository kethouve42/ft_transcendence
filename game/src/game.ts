
type Paddle = {
  x: number;
  y: number;
}

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

type Score = {
  left: number;
  right: number;
}

type Timer = {
  start: number;
  duration: number;
  isRunning: boolean;
}  

const canvas = document.getElementById('pong') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');


const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const speed = 5;

const leftPaddle: Paddle = {
  x: 0,
  y: canvas.height / 2 - paddleHeight / 2,
};

const rightPaddle: Paddle = {
  x: canvas.width - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
};

const ball: Ball = {
  x: canvas.width / 2 - ballSize / 2,
  y: canvas.height / 2 - ballSize / 2,
  vx: speed,
  vy: speed,
}

const score: Score = {
  left: 0,
  right: 0,
}

const timer: Timer = {
  start: 0,
  duration: 0,
  isRunning: false,
};

const keys: Record<string, boolean> = {};

document.addEventListener('keydown', (e: KeyboardEvent) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e: KeyboardEvent) => {
  keys[e.key] = false;
});

function drawRectangle(x: number, y: number, width: number, height: number, color: string = 'white'): void {
  if (!ctx) {
    throw new Error('Canvas context is not available');
  }
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall(): void {
  drawRectangle(ball.x, ball.y, ballSize, ballSize);
}

function drawScore(): void {
  if (!ctx) {
    throw new Error('Canvas context is not available');
  }
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`SCORE: ${score.left}`, 15, 40);
  ctx.fillText(`SCORE: ${score.right}`, canvas.width - 210, 40);
}

function drawTimer(): void {
  if (!ctx) {
    throw new Error('Canvas context is not available');
  }
  const elapsed = Math.floor((Date.now() - timer.start) / 1000);
  const remaining = Math.max(0, timer.duration - elapsed);
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`TIME: ${remaining}`, canvas.width / 2 - 50, 20);
}

function startTimer(duration: number): void {
  timer.start = Date.now();
  timer.duration = duration;
  timer.isRunning = true;
}

function resetTimer(): void {
  timer.start = 0;
  timer.duration = 0;
  timer.isRunning = false;
}

function startGame(): void {
  startTimer(60);
}

function resetBall(): void {
  ball.x = canvas.width / 2 - ballSize / 2;
  ball.y = canvas.height / 2 - ballSize / 2;
  ball.vx = -ball.vx;
  ball.vy = Math.random() < 0.5 ? speed : -speed;
}

function resetGame(): void {
  score.left = 0;
  score.right = 0;
  resetTimer();
  resetBall();
}

function update(): void {
  if (keys['ArrowUp'] && rightPaddle.y > 0) {
    rightPaddle.y -= speed;
  }
  if (keys['ArrowDown'] && rightPaddle.y < canvas.height - paddleHeight) {
    rightPaddle.y += speed;
  }
  if (keys['w'] && leftPaddle.y > 0) {
    leftPaddle.y -= speed;
  }
  if (keys['s'] && leftPaddle.y < canvas.height - paddleHeight) {
    leftPaddle.y += speed;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y <= 0 || ball.y >= canvas.height - ballSize) {
    ball.vy = -ball.vy;
  }

  if (
    (ball.x <= leftPaddle.x + paddleWidth && ball.x >= leftPaddle.x &&
      ball.y + ballSize >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight) ||
    (ball.x + ballSize >= rightPaddle.x && ball.x <= rightPaddle.x + paddleWidth &&
      ball.y + ballSize >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight)
  ) {
    ball.vx = -ball.vx;
  }

  if (ball.x < 0 || ball.x > canvas.width) {
    score.left += ball.x < 0 ? 1 : 0;
    score.right += ball.x > canvas.width ? 1 : 0;
    resetBall();
  }

  if (timer.isRunning) {
    const elapsed = Math.floor((Date.now() - timer.start) / 1000);
    const remaining = Math.max(0, timer.duration - elapsed);
    if (remaining <= 0) {
      timer.isRunning = false;
      alert('Time is up! Final Score: Left - ' + score.left + ', Right - ' + score.right);
      setTimeout(() => {
        resetGame();
        startTimer(60);
      }, 10)
      return;
    }
  }
}

function render(): void {
  if (!ctx) {
    throw new Error('Canvas context is not available');
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRectangle(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
  drawRectangle(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
  drawBall();
  drawScore();
  drawTimer();
}

function gameLoop(): void {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

startGame();
gameLoop();