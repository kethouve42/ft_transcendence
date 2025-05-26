import React, { useEffect, useRef, useState } from "react"
import { paddleHeight, paddleWidth, leftPaddle, rightPaddle, drawRectangle, initPaddle } from './paddle.js'
import { ballSize, speed, ball, drawBall, resetBall } from './ball.js'
import { score, drawScore } from './score.js'
import { timer, drawTimer, startTimer, resetTimer } from './timer.js'
import './css/style.css'

let mode: 'local' | 'ai' = 'local';
const epsilon = 0.1
let time = 60
let score_df = 1

export default function Game() {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showMenu, setShowMenu] = useState(true)
  const [ballSpeed, setBallSpeed] = useState(speed)
  const [showSettings, setShowSettings] = useState(false)
  const [timerMod, setTimerMod] = useState(time)
  let [scoreMod, setScoreMod] = useState(score_df)
  let   animationId: number

  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    initPaddle(canvas)
    const keys: Record<string, boolean> = {}

    const keyDown = (e: KeyboardEvent) => { keys[e.key] = true; }
    const keyUp = (e: KeyboardEvent) => { keys[e.key] = false; }
    window.addEventListener("keydown", keyDown)
    window.addEventListener("keyup", keyUp)

    if (scoreMod == 0)
      scoreMod = 1

    function startGame(): void {
      startTimer(timerMod)
    }

    function resetGame(): void {
      score.left = 0
      score.right = 0
      resetTimer()
      resetBall(canvas!)
    }

    function update(): void {
      if (mode === 'local') {
        if (keys['ArrowUp'] && rightPaddle.y > 0) {
          rightPaddle.y -= speed
        }
        if (keys['ArrowDown'] && rightPaddle.y < canvas!.height - paddleHeight) {
          rightPaddle.y += speed
        }
      }
      else if (mode === 'ai') {
        if (ball.y + ballSize / 2 < rightPaddle.y + paddleHeight / 2 && rightPaddle.y > 0)
          rightPaddle.y -= speed
        else if (ball.y + ballSize / 2 > rightPaddle.y + paddleHeight / 2 && rightPaddle.y < canvas!.height - paddleHeight)
          rightPaddle.y += speed
      }

      if (keys['w'] && leftPaddle.y > 0) {
        leftPaddle.y -= speed
      }
      if (keys['s'] && leftPaddle.y < canvas!.height - paddleHeight) {
        leftPaddle.y += speed
      }

      ball.x += ball.vx
      ball.y += ball.vy

      if (ball.y <= 0 || ball.y >= canvas!.height - ballSize) {
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

      if (ball.x < 0 || ball.x > canvas!.width) {
        score.left += ball.x < 0 ? 1 : 0
        score.right += ball.x > canvas!.width ? 1 : 0
        resetBall(canvas!)
      }

      if (timer.isRunning) {
        const elapsed = Math.floor((Date.now() - timer.start) / 1000)
        const remaining = Math.max(0, timer.duration - elapsed)
        if (remaining <= 0) {
          timer.isRunning = false
          alert('Time is up! Final Score: Left - ' + score.left + ', Right - ' + score.right)
          setShowMenu(true)
          resetGame()
          return
        }
      }

      if (score.left == scoreMod || score.right == scoreMod) {
        timer.isRunning = false
        alert('Time is up! Final Score: Left - ' + score.left + ', Right - ' + score.right)
        setShowMenu(true)
        resetGame()
        return
      }
    }

    function render(): void {
      if (!ctx) {
        throw new Error('Canvas context is not available')
      }
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      drawRectangle(ctx, leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight)
      drawRectangle(ctx, rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight)
      drawBall(ctx)
      drawScore(ctx, canvas!)
      drawTimer(ctx, canvas!)
    }

    function gameLoop(): void {
      update()
      render()
      animationId = requestAnimationFrame(gameLoop)
    }

    if (!showMenu) {
      resetGame()
      startGame()
      gameLoop()
    }

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      cancelAnimationFrame(animationId)
    }
  }, [showMenu])

  return (
    <div className="app-container">
      <h1 className="title">Pong game</h1>
      {showMenu && !showSettings && (
        <div id="menu" className="menu">
          <button className="menu-btn" onClick={() => { mode = 'local'; setShowMenu(false)}}> Local </button>
          <button className="menu-btn" onClick={() => {mode = 'ai'; setShowMenu(false)}}> AI </button>
          <button className="menu-btn" onClick={() => setShowSettings(true)}>Settings</button>
        </div>
      )}
      {showSettings && (
        <div className="settings-panel">
          <h1>Settings</h1>
          <div className="settings-grid">
            <div className="settings-ball">
              <label className="settings-label">Vitesse de la balle: {ballSpeed}</label>
                <input type="range"
                      min={1} max={20} 
                      value={ballSpeed} 
                      onChange={e => setBallSpeed(Number(e.target.value))}
                ></input>
            </div>
            <div className="settings-timer">
            <label className="settings-label"></label>
              Le temps en seconde du match: {timerMod}
              <input type="number"
                    min={10} max={300}
                    value={timerMod}
                    onChange={e => setTimerMod(Number(e.target.value))}
              ></input>
            </div>
            <div className="settings-score">
            <label className="settings-label"></label>
              Le nombre de points pour finir: {scoreMod}
              <input type="number"
                    min={1}
                    value={scoreMod}
                    onChange={e => setScoreMod(Number(e.target.value))}
              ></input>
            </div>
          <button className="menu-btn save-btn"
                  onClick={() => {
                      const signX = Math.sign(ball.vx) || 1
                      const signY = Math.sign(ball.vy) || 1
                      ball.vx = signX * ballSpeed
                      ball.vy = signY * ballSpeed }}>Save</button>
          <button className="menu-btn save-btn" onClick={() => setShowSettings(false)}>Close</button>
        </div>
      </div>
      )}
      {!showMenu && (
      <canvas
        ref={canvasRef}
        id="pong"
        className="pong-canvas"
        width={800}
        height={500}
        style={{ background: "black", display: "block", margin: "0 auto" }}
      />
      )}
    </div>
  );
}