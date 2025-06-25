import { paddleHeight, paddleWidth, leftPaddle, rightPaddle, drawRectangle, initPaddle } from './paddle.js'
import { ballSize, speed as baseSpeed, ball, drawBall, resetBall } from './ball.js'
import { score, drawScore } from './score.js'
import { timer, drawTimer, startTimer, resetTimer } from './timer.js'
import { updatePowerUps, drawPowerUp } from "./power_up.js"
import { t } from "../../i18n"
import "../../css/style.css"

type Panel =  "menu" | "settings" | "ai" | "keyConfig" | "rules" | "game"

let mode: 'local' | 'ai' = 'local'
const epsilon = 0.1 // Constante pour les calculs de collision pour éviter que la balle coince.
let aiDifficulty: 'easy' | 'medium' | 'hard' = 'easy'
let ballSpeed = baseSpeed
let timerMod = 60
let scoreMod = 10

let keyBinding = {
  player1Up: "w",
  player1Down: "s",
  player2Up: "ArrowUp",
  player2Down: "ArrowDown",
}

let pendingBinding: keyof typeof keyBinding | null = null

let animationId: number
let keyPressed: Record<string, boolean> = {}
let currentPanel: Panel = "menu"
let lastAiUpdate = Date.now()
let previousTargetY = 0
let nextTargetY = 0

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D

// Prise en compte du DOM
export function gameViews() {
  return `
  <div id="menu" class="menu">
    <button id="btn-local" class="menu-btn">${t("menu.play_local")}</button>
    <button id="btn-ai" class="menu-btn">${t("menu.play_ai")}</button>
    <button id="btn-rules" class="menu-btn">${t("menu.rules")}</button>
    <button id="btn-settings" class="menu-btn">${t("menu.settings")}</button>
  </div>
  `
}

function renderPanelAI() {
  return `
  <div id="panel-ai" class="settings-panel">
    <div class="settings-grid">
      <label class="settings-label">${t("ai.title")}</label>
      <select id="select-ai-difficulty" class="menu-btn save-btn">
        <option value="easy">${t("ai.easy")}</option>
        <option value="medium">${t("ai.mid")}</option>
        <option value="hard">${t("ai.hard")}</option>
      </select>
    </div>
    <div class="settings-actions">
      <button id="btn-start-ai" class="menu-btn save-btn">${t("ai.start")}</button>
      <button id="btn-close-ai" class="menu-btn save-btn">${t("ai.close")}</button>
    </div>
  </div>
  `
}

function renderPanelRules() {
  return `
      <div id="panel-rules" class="rules-panel">
      <h2>${t("rules.title")}</h2>
      <ul class="rules-list">
        <li>
          ${t("rules.power_up")}
          <ul>
            <li>
              <span class="speed-up"></span>
              ${t("rules.effects.faster")}
            </li>
            <li>
              <span class="speed-down"></span>
              ${t("rules.effects.faster")}
            </li>
          </ul>
        </li>
        <li>${t("rules.spawn")}</li>
        <li>${t("rules.collect")}</li>
        <li>${t("rules.duration")}</li>
      </ul>
      <div class="settings-actions">
        <button id="btn-close-rules" class="menu-btn save-btn">${t("rules.cancel")}</button>
      </div>
    </div>
  `
}

function renderPanelSettings() {
  return `
      <div id="panel-settings" class="settings-panel">
      <h1>${t("settings.title")}</h1>
      <div class="settings-grid">
        <div class="settings-ball">
          <label class="settings-label">
            ${t("settings.speed")} <span id="display-ball-speed">10</span>
          </label>
          <input
            type="range"
            id="input-ball-speed"
            min="1" max="20"
            class="w-full"
          />
        </div>
        <div class="settings-timer">
          <label class="settings-label"></label>
            ${t("settings.time")} <span id="display-timer-mod">60</span>
          <input
            type="number"
            id="input-timer-mod"
            min="10" max="300"
            class="ml-2 w-20 p-1 bg-gray-800 rounded"
          />
        </div>
        <div class="settings-score">
          <label class="settings-label"></label>
            ${t("settings.points")} <span id="display-score-mod">10</span>
          <input
            type="number"
            id="input-score-mod"
            min="1"
            class="ml-2 w-20 p-1 bg-gray-800 rounded"
          />
        </div>
      </div>
      <div class="settings-actions">
        <button id="btn-save-settings" class="menu-btn save-btn">${t("settings.save")}</button>
        <button id="btn-close-settings" class="menu-btn save-btn">${t("settings.cancel")}</button>
      </div>
    </div>
  `
}

function renderPanelKeys() {
  return `
      <div id="panel-keyconfig" class="settings-panel">
      <h1>${t("local.title")}</h1>
      <p>${t("local.ex")}</p>
      <div class="settings-grid">
        <div>
          <label>${t("local.up1")}</label>
          <button id="btn-bind-p1-up" class="menu-btn save-btn">
            <span id="bind-p1-up-display">W</span>
          </button>
        </div>
        <div>
          <label>${t("local.down1")}</label>
          <button id="btn-bind-p1-down" class="menu-btn save-btn">
            <span id="bind-p1-down-display">S</span>
          </button>
        </div>
        <div>
          <label>${t("local.up2")}</label>
          <button id="btn-bind-p2-up" class="menu-btn save-btn">
            <span id="bind-p2-up-display">ArrowUp</span>
          </button>
        </div>
        <div>
          <label>${t("local.down2")}</label>
          <button id="btn-bind-p2-down" class="menu-btn save-btn">
            <span id="bind-p2-down-display">ArrowDown</span>
          </button>
        </div>
      </div>
      <div class="settings-actions">
        <button id="btn-start-local" class="menu-btn">${t("local.start")}</button>
        <button id="btn-cancel-keyconfig" class="menu-btn">${t("local.cancel")}</button>
      </div>
    </div>
  `
}

function renderGame() {
  return `
    <canvas
      id="pong"
      class="pong-canvas"
      width="800" 
      height="600"
    ></canvas>
  `
}

export function gameEvent() {
  const root = document.getElementById('app')!

  root.querySelector('#btn-local')?.addEventListener("click", () => showOnly("keyConfig"))
  root.querySelector('#btn-ai')?.addEventListener("click", () => showOnly("ai"))
  root.querySelector('#btn-rules')?.addEventListener("click", () => showOnly("rules"))
  root.querySelector('#btn-settings')?.addEventListener("click", () => showOnly("settings"))

  root.querySelector('#btn-close-settings')?.addEventListener("click", () => showOnly("menu"))
  root.querySelector('#btn-close-ai')?.addEventListener("click", () => showOnly("menu"))
  root.querySelector('#btn-close-rules')?.addEventListener("click", () => showOnly("menu"))
  root.querySelector('#btn-cancel-keyconfig')?.addEventListener("click", () => showOnly("menu"))

  root.querySelector('#input-ball-speed')?.addEventListener("input", e => {
    ballSpeed = +(e.target as HTMLInputElement).value
    root.querySelector('#display-ball-speed')!.textContent = ballSpeed.toString()
  })
  root.querySelector('#input-timer-mod')?.addEventListener("input", e => {
    timerMod = +(e.target as HTMLInputElement).value
    root.querySelector('#display-timer-mod')!.textContent = timerMod.toString()
  })
  root.querySelector('#input-score-mod')?.addEventListener("input", e => {
    scoreMod = +(e.target as HTMLInputElement).value
    root.querySelector('#display-score-mod')!.textContent = scoreMod.toString()
  })
  root.querySelector('#btn-save-settings')?.addEventListener("click", () => {
    const signX = Math.sign(ball.vx)||1
    const signY = Math.sign(ball.vy)||1
    ball.vx = signX * ballSpeed
    ball.vy = signY * ballSpeed
    showOnly("menu")
  })

  root.querySelector('#select-ai-difficulty')?.addEventListener("change", e => {
    aiDifficulty = (e.target as HTMLSelectElement).value as any
  })
  root.querySelector('#btn-start-ai')?.addEventListener("click", () => startMatch())

  function startKeyBind(action: keyof typeof keyBinding) {
    pendingBinding = action
    window.addEventListener("keydown", onKeyDownDuringBinding)
  }

  root.querySelector('#btn-bind-p1-up')?.addEventListener("click", () => startKeyBind("player1Up"))
  root.querySelector('#btn-bind-p1-down')?.addEventListener("click", () => startKeyBind("player1Down"))
  root.querySelector('#btn-bind-p2-up')?.addEventListener("click", () => startKeyBind("player2Up"))
  root.querySelector('#btn-bind-p2-down')?.addEventListener("click", () => startKeyBind("player2Down"))
  root.querySelector('#btn-start-local')?.addEventListener("click", () => startMatch())

  window.addEventListener("keydown", e => keyPressed[e.key]=true)
  window.addEventListener("keyup",   e => keyPressed[e.key]=false)

  if (currentPanel === "game") {
    canvas = document.getElementById("pong") as HTMLCanvasElement
    ctx = canvas.getContext("2d")!
  }
}

/*
Gestion de l'affichage des  différents écrans.
La fonction se base sur les booléens pour savoir si l'élément doit être visible ou doit être caché.
Pour chacun des menus, on inverse le flag correspondant.
*/
function renderUI() {
  const root = document.getElementById('app')!
  let html = ""
  switch (currentPanel) {
    case "menu":
      html = gameViews()
      break
    case "settings":
      html = renderPanelSettings()
      break
    case "ai":
      html = renderPanelAI()
      break
    case "keyConfig": 
      html = renderPanelKeys()
      break
    case "rules":
      html = renderPanelRules()
      break
    case "game":
      html = renderGame()
      break
  }
  root.innerHTML = html
  gameEvent()
}

function showOnly(panel: Panel) {
  currentPanel = panel
  renderUI()
}

function onKeyDownDuringBinding(e: KeyboardEvent) {
  if (!pendingBinding)
    return
  keyBinding[pendingBinding] = e.key
  pendingBinding = null
  window.removeEventListener("keydown", onKeyDownDuringBinding)
  renderUI() // met à jour l’affichage des touches
}

/*
  Simule la trajectoire de la balle avec sa position et sa vitesse:
    - Copie les positions x et y puis les vitesses vx, vy.
    - Tant que la balle va à droite et que x est à gauche du paddle de l'IA.
    - Calcul du temps pour que la balle atteigne le haut (y=0) ou le bas (y=canvasHeight - ballSize):
      - Si vy > 0 (se dirige vers le bas), timeToWall = (bas - y) / vy.
      - Si vy < 0 (se dirige vers le haut), timeToWall = (0 - y) / vy = -y/vy.
      - Si vy == 0 (se dirige parfaitement à l'horizontale), on met Infinity (pas de rebond).
    - Calcul du temps pour que la balle atteigne la raquette droite (t=d/v, timeToPaddle=(raquette - position de la balle) / vitesse de la balle).
    - Si que la balle atteint la raquette avant le mur, on sait que l'impact se fera ici. On peut donc break la boucle.
    - Sinon la balle touche d'abord le mur (en inversant la vy pour qu'elle simule le rebond), donc on avance la balle jusqu'au moment ou elle atteint la raquette.
    - Initialise le centre de la balle.
    - On force le centre de la raquette à rester entre 50 (paddleHeight / 2) et 450 (canvasHeight - paddleHeight / 2), pour que la raquette ne déborde pas.
    - Retourne le top y, donc place le centre de la raquette.
*/
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

/*
  Cette fonction est appelée chaque frame quand mode = 'ai'. Elle calcul une fois par seconde la prochaine cible de l'IA:
    - Lit le temps actuel en milliseconde.
    - Si au moins 1 secondes s'est écoulé depuis la dernière mise à jour de la cible:
      - Calcul le nombre de seconde réelle écoulée (proche de 1).
      - On force Prev à rester entre 0 et 1. Sert à calculer t.
      - Consitue la cible (au moment du rafraîchissement).
      - Initialise currentInterTargetY = dernière position + (prochaine position - dernière) * 1. (Ne s'applique pas pour le premier appel)
      - Copie la postion actuelle pour qu'elle devienne la dernière position.
      - Prédit la future position (top y) de la raquette grâce à la balle.
      - Prédit la future position (center y) de la raquette grâce à center y.
      - Ajoute un random de pixel entre -120 et +120 pour easy, et -60 et +60 pour medium, et 0 en hard.
      - Puis on initialise le centre de la prochaine cible en ajoutant le random.
      - On force nextTargetY à rester entre 0 et canvasHeight - paddleHeight pour que le bord sup ne sort pas de la raquette.
      - Enregistre le timestamp du dernier calcul pour repartir sur 1 seconde.
    - Calcul le temps écoulé depuis la dernière mise à jour.
    - Force la valeur à rester entre 0 et 1 pour éviter d’outrepasser la plage d’interpolation.
    - Calcul la cible actuelle entre previous et next en fonction de t.
    Lorsque t=0, la mise à jour n'est pas encore faite (currentTarget=previousTarget), si t=1, mise à jour est faite (donc currentTarget=nextTarget).
    - Convertit le centre actuel en top y pour savoir où positionner la raquette.
    - Calcul en pixels la distance entre le top y actuel et celui désiré.
    - Initialise la constante de déplacement max pour l'IA.
    - Si la distance est inférieure ou égale à MaxMove, on déplace exactement la raquette sur la cible.
    - Sinon on avance la raquette d'un petit pas vers -maxmove ou +maxmove.
    - On force une nouvelle fois la position de la raquette pour éviter toute erreur.
*/
function aiStep() {
  const now = Date.now()
  if (now - lastAiUpdate >= 1000) {
    const sec = (now - lastAiUpdate) / 1000
    const Prev = Math.min(Math.max(sec, 0), 1)
    const currentInterTargetY = previousTargetY + (nextTargetY - previousTargetY) * Prev
    previousTargetY = currentInterTargetY
    
    const predictTopY = predictBallY(ball, canvas!.height)
    const predictCenterY = predictTopY + paddleHeight / 2
    
    let offset = 0
    if (aiDifficulty === "easy")
      offset = (Math.random() - 0.5) * 240
    else if (aiDifficulty === "medium")
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
  const maxMove = baseSpeed * 2
  if (Math.abs(delta) <= maxMove) {
    rightPaddle.y = desiredTopY
  }
  else {
    rightPaddle.y += Math.sign(delta) * maxMove
  }
  rightPaddle.y = Math.max(0, Math.min(canvas!.height - paddleHeight, rightPaddle.y))
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

function endGame() {
  let winner: "left" | "right" | null = null;
  if (score.left === scoreMod)
    winner = "left";
  else if (score.right === scoreMod)
    winner = "right";

  // Ne fonctionne pas encore, probleme soit de not found soit de cors.
  fetch("api/matchs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: new Date().toISOString(),
      duration: timerMod, // test
      user1_id: 1, // test
      user2_id: 2, // test
      winner_id: 1, // test
      score: `${score.left}-${score.right}`
    })
  }).catch(() => {});

  alert('Time is up! Final Score: Left - ' + score.left + ', Right - ' + score.right);
  resetGame();
  showOnly("menu");
}

function update() {
  if (mode === "local") 
  {
    if (keyPressed[keyBinding.player2Up]   && rightPaddle.y > 0)
      rightPaddle.y -= baseSpeed
    if (keyPressed[keyBinding.player2Down] && rightPaddle.y < canvas!.height-paddleHeight)
      rightPaddle.y += baseSpeed
  } 
  else
    aiStep()
  if (keyPressed[keyBinding.player1Up]   && leftPaddle.y > 0)
    leftPaddle.y -= baseSpeed
  if (keyPressed[keyBinding.player1Down] && leftPaddle.y < canvas!.height-paddleHeight)
    leftPaddle.y += baseSpeed

  updatePowerUps(Date.now(), canvas!.width, canvas!.height, ball)
  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.y <= 0 || ball.y >= canvas!.height - ballSize)
    ball.vy = -ball.vy

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
    ball.x = rightPaddle.x - ballSize
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
      endGame()
      return
    }
  }

  if (score.left == scoreMod || score.right == scoreMod) {
    timer.isRunning = false
    endGame()
    return
  }
}

function render() {
  ctx!.clearRect(0,0,canvas!.width,canvas!.height)
  drawRectangle(ctx!, leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight)
  drawRectangle(ctx!, rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight)
  drawBall(ctx!)
  drawPowerUp(ctx!)
  drawScore(ctx!, canvas!)
  drawTimer(ctx!, canvas!)
}

function gameLoop() {
  update()
  render()
  if (timer.isRunning) 
    requestAnimationFrame(gameLoop)
}

function startMatch() {
  mode = (currentPanel === "ai") ? "ai" : "local"
  showOnly("game")
  initPaddle(canvas!)
  resetBall(canvas!)
  resetTimer()
  startTimer(timerMod)
  gameLoop()
}
/*
window.addEventListener("load", () => {
  renderUI()
})*/