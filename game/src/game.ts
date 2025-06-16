import { paddleHeight, paddleWidth, leftPaddle, rightPaddle, drawRectangle, initPaddle } from './paddle.js'
import { ballSize, speed as baseSpeed, ball, drawBall, resetBall } from './ball.js'
import { score, drawScore } from './score.js'
import { timer, drawTimer, startTimer, resetTimer } from './timer.js'
import { updatePowerUps, drawPowerUp } from "./power_up.js"

let mode: 'local' | 'ai' = 'local'
const epsilon = 0.1 // Constante pour les calculs de collision pour éviter que la balle coince.
let aiDifficulty: 'easy' | 'medium' | 'hard' = 'easy'
let ballSpeed = baseSpeed
let timerMod = 60
let scoreMod = 10

// Flag pour l'affichage des écrans
let showMenu = true // Variable qui affiche ou non le menu initial du jeu.
let showSettings = false // Variable qui affiche ou non les settings du jeu.
let showMenuAI = false // Variable qui affiche le menu AI pour choisir la difficulté.
let showKeyConfig = false // Variable qui affiche les touches.
let showRule = false // Variable qui affiche les rules.

let keyBinding = {
  player1Up: "w",
  player1Down: "s",
  player2Up: "ArrowUp",
  player2Down: "ArrowDown",}
let pendingBinding: keyof typeof keyBinding | null = null

let animationId: number // Stocke l'identifant de requestAnimationFrame
let keyPressed: Record<string, boolean> = {}

// Prise en compte du DOM
const menu            = document.getElementById("menu")!
const panelSettings   = document.getElementById("panel-settings")!
const panelAI         = document.getElementById("panel-ai")!
const panelKeyConfig  = document.getElementById("panel-keyconfig")!
const panelRules      = document.getElementById("panel-rules")!
const canvas          = document.getElementById("pong") as HTMLCanvasElement
const ctx             = canvas.getContext("2d")!

const inputBallSpeed   = document.getElementById("input-ball-speed") as HTMLInputElement
const displayBallSpeed = document.getElementById("display-ball-speed") as HTMLSpanElement
const inputTimerMod    = document.getElementById("input-timer-mod") as HTMLInputElement
const displayTimerMod  = document.getElementById("display-timer-mod") as HTMLSpanElement
const inputScoreMod    = document.getElementById("input-score-mod") as HTMLInputElement
const displayScoreMod  = document.getElementById("display-score-mod") as HTMLSpanElement

const btnBindP1Up      = document.getElementById("btn-bind-p1-up")! as HTMLButtonElement
const btnBindP1Down    = document.getElementById("btn-bind-p1-down")! as HTMLButtonElement
const btnBindP2Up      = document.getElementById("btn-bind-p2-up")! as HTMLButtonElement
const btnBindP2Down    = document.getElementById("btn-bind-p2-down")! as HTMLButtonElement
const dispP1Up         = document.getElementById("bind-p1-up-display")! as HTMLSpanElement
const dispP1Down       = document.getElementById("bind-p1-down-display")! as HTMLSpanElement
const dispP2Up         = document.getElementById("bind-p2-up-display")! as HTMLSpanElement
const dispP2Down       = document.getElementById("bind-p2-down-display")! as HTMLSpanElement

const selectAIDiff     = document.getElementById("select-ai-difficulty")! as HTMLSelectElement

const btnLocal         = document.getElementById("btn-local")! as HTMLButtonElement
const btnAI            = document.getElementById("btn-ai")! as HTMLButtonElement
const btnRules         = document.getElementById("btn-rules")! as HTMLButtonElement
const btnSettings      = document.getElementById("btn-settings")! as HTMLButtonElement
const btnSaveSettings  = document.getElementById("btn-save-settings")! as HTMLButtonElement
const btnCloseSettings = document.getElementById("btn-close-settings")! as HTMLButtonElement
const btnStartAI       = document.getElementById("btn-start-ai")! as HTMLButtonElement
const btnCloseAI       = document.getElementById("btn-close-ai")! as HTMLButtonElement
const btnStartLocal    = document.getElementById("btn-start-local")! as HTMLButtonElement
const btnCancelKeyCfg  = document.getElementById("btn-cancel-keyconfig")! as HTMLButtonElement

/*
Gestion de l'affichage des  différents écrans.
La fonction se base sur les booléens pour savoir si l'élément doit être visible ou doit être caché.
Pour chacun des menus, on inverse le flag correspondant.
*/
function renderUI() {
  menu.classList.toggle("hidden", !showMenu)
  panelSettings.classList.toggle("hidden", !showSettings)
  panelAI.classList.toggle("hidden", !showMenuAI)
  panelKeyConfig.classList.toggle("hidden", !showKeyConfig)
  panelRules.classList.toggle("hidden", !showRule)
  canvas.classList.toggle("hidden", showMenu || showKeyConfig || showSettings || showMenuAI || showRule)
}

/*
Déterminent quel menu doit s'afficher puis rappelle renderUI() pour appliquer les changements.
Réinitialise tous les menu a false.
Activation du menu correspondant -> showOnly("game") -> affiche le jeu.
Dans game, juste break puisque on veut afficher le canvas du jeu.
*/
function showOnly(panel: "menu" | "settings" | "ai" | "keyConfig" | "rules" | "game") {
  showMenu = showSettings = showMenuAI = showKeyConfig = showRule = false
  switch (panel) {
    case "menu":
      showMenu = true
      break
    case "settings":
      showSettings = true
      break
    case "ai":
      showMenuAI = true
      break
    case "keyConfig":
      showKeyConfig = true
      break
    case "rules":
      showRule = true
      break
    case "game":
      break
  }
  renderUI()
}

// Bouton click
btnLocal.addEventListener("click", () => showOnly("keyConfig"))
btnAI.addEventListener("click", () => showOnly("ai"))
btnRules.addEventListener("click", () => showOnly("rules"))
btnSettings.addEventListener("click", () => showOnly("settings"))
btnCloseSettings.addEventListener("click", () => showOnly("menu"))
btnCloseAI.addEventListener("click", () => showOnly("menu"))
btnCancelKeyCfg.addEventListener("click", () => showOnly("menu"))

inputBallSpeed.addEventListener("input", () => {
  ballSpeed = Number(inputBallSpeed.value)
  displayBallSpeed.textContent = ballSpeed.toString()
})

inputTimerMod.addEventListener("input", () => {
  timerMod = Number(inputTimerMod.value)
  displayTimerMod.textContent = timerMod.toString()
})

inputScoreMod.addEventListener("input", () => {
  scoreMod = Number(inputScoreMod.value)
  displayScoreMod.textContent = scoreMod.toString()
})

btnSaveSettings.addEventListener("click", () => {
  const signX = Math.sign(ball.vx) || 1
  const signY = Math.sign(ball.vy) || 1
  ball.vx = signX * ballSpeed
  ball.vy = signY * ballSpeed
  showOnly("menu")
})

btnStartAI.addEventListener("click", () => {
  aiDifficulty = selectAIDiff.value as any
  startMatch()
})

function startKeyBind(action: keyof typeof keyBinding) {
  pendingBinding = action
  window.addEventListener("keydown", onKeyDownDuringBinding)
}

btnBindP1Up.addEventListener("click", () => startKeyBind("player1Up"))
btnBindP1Down.addEventListener("click", () => startKeyBind("player1Down"))
btnBindP2Up.addEventListener("click", () => startKeyBind("player2Up"))
btnBindP2Down.addEventListener("click", () => startKeyBind("player2Down"))

btnStartLocal.addEventListener("click", () => startMatch())

window.addEventListener("keydown", e => { keyPressed[e.key] = true })
window.addEventListener("keyup", e => { keyPressed[e.key] = false })

/*
Gère la reconfiguration dynamique d’une touche.
Ne s'active uniquement lorsque le listener est en mode keydown (touche pressée)
Donc pendant que la touche est pressée, on change la touche si l'utilisateur le souhaite puis on stop l'écoute.
*/
function onKeyDownDuringBinding(e: KeyboardEvent) {
  if (!pendingBinding) 
    return
  keyBinding[pendingBinding] = e.key
  dispP1Up.textContent = keyBinding.player1Up
  dispP1Down.textContent = keyBinding.player1Down
  dispP2Up.textContent = keyBinding.player2Up
  dispP2Down.textContent = keyBinding.player2Down
  pendingBinding = null
  window.removeEventListener("keydown", onKeyDownDuringBinding)
}

let lastAiUpdate = Date.now()
let previousTargetY = 0
let nextTargetY = 0

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

function update() {
  if (mode === "local") 
  {
    if (keyPressed[keyBinding.player2Up]   && rightPaddle.y > 0)
      rightPaddle.y -= baseSpeed
    if (keyPressed[keyBinding.player2Down] && rightPaddle.y < canvas.height-paddleHeight)
      rightPaddle.y += baseSpeed
  } 
  else
    aiStep()
  if (keyPressed[keyBinding.player1Up]   && leftPaddle.y > 0)
    leftPaddle.y -= baseSpeed
  if (keyPressed[keyBinding.player1Down] && leftPaddle.y < canvas.height-paddleHeight)
    leftPaddle.y += baseSpeed

  updatePowerUps(Date.now(), canvas.width, canvas.height, ball)
  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.y <= 0 || ball.y >= canvas.height - ballSize)
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
      showMenu = true
      resetGame()
      renderUI()
      return
    }
  }

  if (score.left == scoreMod || score.right == scoreMod) {
    timer.isRunning = false
    alert('Time is up! Final Score: Left - ' + score.left + ', Right - ' + score.right)
    showMenu = true
    resetGame()
    renderUI()
    return
  }
}

function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height)
  drawRectangle(ctx, leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight)
  drawRectangle(ctx, rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight)
  drawBall(ctx)
  drawPowerUp(ctx)
  drawScore(ctx, canvas)
  drawTimer(ctx, canvas)
}

function gameLoop() {
  update()
  render()
  animationId = requestAnimationFrame(gameLoop)
}

function startMatch() {
  initPaddle(canvas)
  mode = showMenuAI ? "ai" : "local"
  lastAiUpdate = Date.now()
  previousTargetY = rightPaddle.y + paddleHeight/2
  nextTargetY = previousTargetY
  resetBall(canvas)
  resetTimer()
  showOnly("game")
  startTimer(timerMod)
  gameLoop()
}

window.addEventListener("load", () => {
  displayBallSpeed.textContent = ballSpeed.toString()
  displayTimerMod.textContent  = timerMod.toString()
  displayScoreMod.textContent  = scoreMod.toString()
  showOnly("menu")
});