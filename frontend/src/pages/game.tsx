import { useEffect, useRef } from "react";

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const speed = 5;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Types
    type Paddle = { x: number; y: number };
    type Ball = { x: number; y: number; vx: number; vy: number };
    type Score = { left: number; right: number };
    type Timer = { start: number; duration: number; isRunning: boolean };

    // State
    const leftPaddle: Paddle = { x: 0, y: canvas.height / 2 - paddleHeight / 2 };
    const rightPaddle: Paddle = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2 };
    const ball: Ball = { x: canvas.width / 2 - ballSize / 2, y: canvas.height / 2 - ballSize / 2, vx: speed, vy: speed };
    const score: Score = { left: 0, right: 0 };
    const timer: Timer = { start: 0, duration: 20, isRunning: false };
    const keys: Record<string, boolean> = {};

    // Event listeners
    const keyDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const keyUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    // Drawing functions
    function drawRectangle(x: number, y: number, width: number, height: number, color: string = "white") {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    }
    function drawBall() {
      drawRectangle(ball.x, ball.y, ballSize, ballSize);
    }
    function drawScore() {
      ctx.font = "40px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`SCORE: ${score.left}`, 15, 40);
      ctx.fillText(`SCORE: ${score.right}`, canvas.width - 210, 40);
    }
    function drawTimer() {
      const elapsed = Math.floor((Date.now() - timer.start) / 1000);
      const remaining = Math.max(0, timer.duration - elapsed);
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`TIME: ${remaining}`, canvas.width / 2 - 50, 20);
    }

    // Game logic
    function startTimer(duration: number) {
      timer.start = Date.now();
      timer.duration = duration;
      timer.isRunning = true;
    }
    function resetTimer() {
      timer.start = 0;
      timer.duration = 0;
      timer.isRunning = false;
    }
    function startGame() {
      startTimer(20);
    }
    function resetBall() {
      ball.x = canvas.width / 2 - ballSize / 2;
      ball.y = canvas.height / 2 - ballSize / 2;
      ball.vx = -ball.vx;
      ball.vy = Math.random() < 0.5 ? speed : -speed;
    }
    function resetGame() {
      score.left = 0;
      score.right = 0;
      resetTimer();
      resetBall();
    }
    function update() {
      if (keys["ArrowUp"] && rightPaddle.y > 0) rightPaddle.y -= speed;
      if (keys["ArrowDown"] && rightPaddle.y < canvas.height - paddleHeight) rightPaddle.y += speed;
      if (keys["w"] && leftPaddle.y > 0) leftPaddle.y -= speed;
      if (keys["s"] && leftPaddle.y < canvas.height - paddleHeight) leftPaddle.y += speed;

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.y <= 0 || ball.y >= canvas.height - ballSize) ball.vy = -ball.vy;

      if (
        (ball.x <= leftPaddle.x + paddleWidth && ball.x >= leftPaddle.x &&
          ball.y + ballSize >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight) ||
        (ball.x + ballSize >= rightPaddle.x && ball.x <= rightPaddle.x + paddleWidth &&
          ball.y + ballSize >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight)
      ) {
        ball.vx = -ball.vx;
      }

      if (ball.x < 0 || ball.x > canvas.width) {
        if (ball.x < 0) score.right += 1;
        else score.left += 1;
        resetBall();
      }

      if (timer.isRunning) {
        const elapsed = Math.floor((Date.now() - timer.start) / 1000);
        const remaining = Math.max(0, timer.duration - elapsed);
        if (remaining <= 0) {
          timer.isRunning = false;
          setTimeout(() => {
            /*alert(`Time is up! Final Score: Left - ${score.left}, Right - ${score.right}`);*/
            resetGame();
            startTimer(20);
          }, 10);
        }
      }
    }
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawRectangle(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
      drawRectangle(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
      drawBall();
      drawScore();
      drawTimer();
    }
    function gameLoop() {

      if (!timer.isRunning) {
        return;
      }
      update();
      render();
      requestAnimationFrame(gameLoop);
    }

    startGame();
    gameLoop();

    // Nettoyage des listeners quand le composant est démonté
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Pong game</h1>
      <canvas
        ref={canvasRef}
        id="pong"
        width={800}
        height={500}
        style={{ background: "black", display: "block", margin: "0 auto" }}
      />
    </div>
  );
}