import React, { useEffect, useRef, useState } from "react"
import { paddleHeight, paddleWidth, leftPaddle, rightPaddle, drawRectangle, initPaddle } from './paddle.js'
import { ballSize, speed, ball, drawBall, resetBall } from './ball.js'
import { score, drawScore } from './score.js'
import { timer, drawTimer, startTimer, resetTimer } from './timer.js'
import './css/style.css'

let mode: 'local' | 'ai' = 'local'
const epsilon = 0.1 // Constante pour les calculs de collision pour éviter que la balle coince.
let time = 60 // Durée par défaut du match. 
let score_df = 10 // Score par défaut du match.
let difficulty: 'easy' | 'medium' | 'hard' = 'easy'

export default function Game() {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showMenu, setShowMenu] = useState(true) // Booléen qui affiche ou non le menu initial du jeu.
  const [ballSpeed, setBallSpeed] = useState(speed) // Constante qui permet de modifier la vitesse de la balle.
  const [showSettings, setShowSettings] = useState(false) // Booléen qui affiche ou non les settings du jeu.
  const [timerMod, setTimerMod] = useState(time) // Constante qui permet de modifier le temps du match.
  const [showMenuAI, setShowMenuAI] = useState(false) // Booléen qui affiche le menu AI pour choisir la difficulté.
  const [easyMod, setEasyMod] = useState<"easy" | "medium" | "hard">(difficulty) // Variable qui permet de choisir la difficulté.
  const [showKeyConfig, setShowKeyConfig] = useState(false) // Booléen qui affiche les touches.
  const [keyBinding, setKeyBinding] = useState({
    player1Up: "w",
    player1Down: "s",
    player2Up: "ArrowUp",
    player2Down: "ArrowDown",
  }) // Constante pour stocke les bind choisis par les utilisateurs.
  const [pendingBinding, setPendingBinding] = useState<"player1Up" | "player1Down" | "player2Up" | "player2Down" | null>(null) // Savoir pendant la config, quelle action se font bind.
  let   [scoreMod, setScoreMod] = useState(score_df) // Variable qui permet de modifier le score maximal du match.
  let   animationId: number // Stocke l'identifant de requestAnimationFrame

  useEffect(() => {
    function onKeyDownDuringBinding(e: KeyboardEvent) {
      // Si aucune action, ne rien faire et quitter.
      if (!pendingBinding)
        return

      // PendingBinding contient une key. On appelle setKeyBinding pour mettre à jour la bonne entrée.
      // L'argument 'prev' représente l’état précédent de keyBindings.
      setKeyBinding((prev) => ({
        ...prev, [pendingBinding]: e.key  // ...prev, conserve toutes les autres associations existantes et 
                                          // [pendingBinding] remplace la touche associée par la valeur voulue. 
      }))
      setPendingBinding(null) // Remets le binding a null pour indiquer que le binding est terminé.
    }

    // Si pendingBinding est non-null cela signifie que l'utilisateur a cliqué sur le bouton. Donc on attend la pression de la touche.
    // Pour ce cas, on ajoute un listener pour capturer le keydown.
    if (pendingBinding)
      window.addEventListener("keydown", onKeyDownDuringBinding)

    // Nettoyage de useEffect.
    return () => {
      window.removeEventListener("keydown", onKeyDownDuringBinding)
    }
  }, [pendingBinding]) // Ce déclenche à chaque fois que pendingBinding change.

  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    initPaddle(canvas) // Initialise les raquettes en position de départ.
    const keys: Record<string, boolean> = {} // Permet de mémoriser l’état des touches.

    const keyDown = (e: KeyboardEvent) => { keys[e.key] = true; } // Touche appuyée
    const keyUp = (e: KeyboardEvent) => { keys[e.key] = false; } // Touche relâchée
    window.addEventListener("keydown", keyDown)
    window.addEventListener("keyup", keyUp)

    let   lastAiUpdate = Date.now()
    let   previousTargetY = rightPaddle.y + paddleHeight / 2 // Initalise au centre Y actuel de la raquette droite.
    let   nextTargetY = rightPaddle.y + paddleHeight / 2 // Sera la prochaine position/cible de l'IA.

    // Contraint de force la variable scoreMod à 1 pour lancer le match.
    if (scoreMod == 0)
      scoreMod = 1

    // Simule la trajectoire de la balle avec sa position et sa vitesse.
    function predictBallY(ball: { x: number; y: number; vx: number; vy: number }, canvasHeight: number) {
      let x = ball.x
      let y = ball.y
      let vx = ball.vx
      let vy = ball.vy
      while (vx > 0 && x < rightPaddle.x) {
        let timeToWall = vy > 0 ? (canvasHeight - ballSize - y) / vy : vy < 0 ? -y / vy : Infinity
        let timeToPaddle = (rightPaddle.x - x) / vx
        if (timeToPaddle < timeToWall) {
          y += vy * timeToPaddle
          x += vx * timeToPaddle
          break
        }
        else {
          x += vx * timeToWall
          y += vy * timeToWall
          vy = -vy
        }
      }
      const centerY = y
      const cCenterY = Math.max(paddleHeight / 2, Math.min(canvasHeight - paddleHeight / 2, centerY))

      return cCenterY - paddleHeight / 2
    }

    // Cette fonction est appelée chaque frame quand mode = 'ai'. Elle calcul une fois par seconde la prochaine cible de l'IA.
    function aiDifficulty(difficulty: "easy" | "medium" | "hard") {
      const now = Date.now()
      if (now - lastAiUpdate >= 1000) {
        const sec = (now - lastAiUpdate) / 1000
        const Prev = Math.min(Math.max(sec, 0), 1)
        const currentInterTargetY = previousTargetY + (nextTargetY - previousTargetY) * Prev

        previousTargetY = currentInterTargetY
        
        const predictTopY = predictBallY(ball, canvas!.height)
        const predictCenterY = predictTopY + paddleHeight / 2
        
        let offset = 0
        if (difficulty === "easy")
          offset = (Math.random() - 0.5) * 240
        else if (difficulty === "medium")
          offset = (Math.random() - 0.5) * 120

        const rawNextCenter = predictCenterY + offset
        nextTargetY = Math.max(0, Math.min(canvas!.height - paddleHeight, rawNextCenter))
        lastAiUpdate = now
      }

      const elapsed = (now - lastAiUpdate) / 1000
      const t = Math.min(Math.max(elapsed, 0), 1)
      const currentTargetY = previousTargetY + (nextTargetY - previousTargetY) * t
      const desiredTopY = currentTargetY - paddleHeight / 2

      const delta = desiredTopY - rightPaddle.y
      const maxMove = speed * 2
      if (Math.abs(delta) <= maxMove) {
        rightPaddle.y = desiredTopY
      }
      else {
        rightPaddle.y += Math.sign(delta) * maxMove
      }
      rightPaddle.y = Math.max(0, Math.min(canvas!.height - paddleHeight, rightPaddle.y))
    }


    // Lancement officiel du timer.
    function startGame(): void {
      startTimer(timerMod)
    }

    function resetGame(): void {
      score.left = 0
      score.right = 0
      resetTimer()
      resetBall(canvas!)
      lastAiUpdate = Date.now()
      previousTargetY = rightPaddle.y
      nextTargetY = rightPaddle.y
    }

    // Elle gère : le déplacement des paddles (local ou IA), la mise à jour de la position de la balle, 
    // les collisions avec le haut/bas ou les raquettes, le scoring (quand la balle sort du canvas), 
    // la fin de match (timer écoulé ou points max atteints).
    function update(): void {
      if (mode === 'local') {
        if (keys[keyBinding.player2Up] && rightPaddle.y > 0) {
          rightPaddle.y -= speed
        }
        if (keys[keyBinding.player2Down] && rightPaddle.y < canvas!.height - paddleHeight) {
          rightPaddle.y += speed
        }
      }
      else if (mode === 'ai') {
        aiDifficulty(easyMod)
      }

      if (keys[keyBinding.player1Up] && leftPaddle.y > 0) {
        leftPaddle.y -= speed
      }
      if (keys[keyBinding.player1Down] && leftPaddle.y < canvas!.height - paddleHeight) {
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
        score.right += ball.x < 0 ? 1 : 0
        score.left += ball.x > canvas!.width ? 1 : 0
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

    if (!showMenu && !showKeyConfig) {
      resetGame()
      startGame()
      gameLoop()
    }

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      cancelAnimationFrame(animationId)
    }
  }, [showMenu, easyMod, timerMod, ballSpeed, scoreMod, showKeyConfig])

  return (
    <div className="app-container">
      <h1 className="title">Pong game</h1>
      {showMenu && !showSettings && !showMenuAI && !showKeyConfig && (
        <div id="menu" className="menu">
          <button className="menu-btn" onClick={() => { mode = 'local'; setShowKeyConfig(true)}}>Local</button>
          <button className="menu-btn" onClick={() => { mode = 'ai'; setShowMenuAI(true)}}>AI</button>
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
      {showMenuAI && (
        <div className="settings-panel">
          <div className="settings-grid">
            <label className="settings-label">Difficulté de l'AI</label>
            <select value={easyMod}
            onChange={e => setEasyMod(e.target.value as  "easy" | "medium" | "hard")}
            className="menu-btn save-btn">
              <option value="easy">Facile</option>
              <option value="medium">Moyenne</option>
              <option value="hard">Difficile</option>
            </select>
            <button className="menu-btn save-btn" onClick={() => {setShowMenu(false); setShowMenuAI(false)}}>Start</button>
            <button className="menu-btn save-btn" onClick={() => setShowMenuAI(false)}>Close</button>
          </div>
        </div>
      )}
      {showKeyConfig && (
        <div className="settings-panel">
        <h1>Configuration des touches - Mode Local</h1>
        <p>Cliquez sur chacun des boutons ci-dessous, puis appuyez sur la touche de votre choix.</p>
        <div className="settings-grid">
          <div>
            <label>Joueur 1 : Monter</label>
            <button className="menu-btn save-btn"
              onClick={() => setPendingBinding("player1Up")}>
              {pendingBinding === "player1Up"
                ? "Appuyez sur une touche"
                : `Touche : ${keyBinding.player1Up}`}
            </button>
          </div>
          <div>
            <label>Joueur 1 : Descendre</label>
            <button className="menu-btn save-btn"
              onClick={() => setPendingBinding("player1Down")}>
              {pendingBinding === "player1Down"
                ? "Appuyez sur une touche"
                : `Touche : ${keyBinding.player1Down}`}
            </button>
          </div>
          <div>
            <label>Joueur 2 : Monter</label>
            <button className="menu-btn save-btn"
              onClick={() => setPendingBinding("player2Up")}>
              {pendingBinding === "player2Up"
                ? "Appuyez sur une touche"
                : `Touche : ${keyBinding.player2Up}`}
            </button>
          </div>
          <div>
            <label>Joueur 2 : Descendre</label>
            <button className="menu-btn save-btn"
              onClick={() => setPendingBinding("player2Down")}>
              {pendingBinding === "player2Down"
                ? "Appuyez sur une touche"
                : `Touche : ${keyBinding.player2Down}`}
            </button>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button className="menu-btn"
            onClick={() => {setShowKeyConfig(false); setShowMenu(false); mode = "local"}}>Start</button>
          <button className="menu-btn"
            onClick={() => {setShowKeyConfig(false)}}>Cancel</button>
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