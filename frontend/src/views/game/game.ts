import { paddleHeight, paddleWidth, leftPaddle, rightPaddle, drawRectangle, initPaddle } from './paddle.js'
import { ballSize, speed as baseSpeed, ball, drawBall, resetBall } from './ball.js'
import { score, drawScore } from './score.js'
import { timer, drawTimer, startTimer, resetTimer } from './timer.js'
import { updatePowerUps, drawPowerUp } from "./power_up.js"
import { navbarView, attachNavbarEvents } from '../navbar.js'
import { loginTournamentView, attachLoginTournamentEvents } from './loginTournament.js'
import { t } from "../../i18n/index.js"
import { navigateTo } from '../../main.js'
import "../../css/style.css"

type Panel =  "menu" | "settings" | "ai" | "keyConfig" | "rules" | "game" | "tournament"

let mode: 'local' | 'ai' | 'tournoi' = 'local'
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
  if (!localStorage.getItem("token")) {
    navigateTo("/login")
    return ""
  }
  return `
  <div class="app-container">
    <div id="menu" class="menu">
      <button id="btn-local" class="menu-btn">${t("menu.play_local")}</button>
      <button id="btn-ai" class="menu-btn">${t("menu.play_ai")}</button>
      <button id="btn-rules" class="menu-btn">${t("menu.rules")}</button>
      <button id="btn-settings" class="menu-btn">${t("menu.settings")}</button>
      <button id="btn-tournament" class="menu-btn">Tournoi</button>
    </div>
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

function renderTournament() {
  const main_login = localStorage.getItem("userLogin") || "Joueur 1"
  const login2 = localStorage.getItem("tournament_login_2") || "Joueur 2"
  const login3 = localStorage.getItem("tournament_login_3") || "Joueur 3"
  const login4 = localStorage.getItem("tournament_login_4") || "Joueur 4"
  return `
    <div class="settings-panel">
      <h1>Tournoi de 4 joueurs.</h1>
      <div class="settings-grid">
        <button id="btn_tp1" class="menu-btn">${main_login}</button>
        <button id="btn_tp2" class="menu-btn">${login2}</button>
        <button id="btn_tp3" class="menu-btn">${login3}</button>
        <button id="btn_tp4" class="menu-btn">${login4}</button>
      </div>
      <div class="settings-action">
        <button id="btn-tst" class="menu-btn save-btn">Lancer le tournoi</button>
        <button id="btn-tc" class="menu-btn save-btn">${t("tournament.cancel")}</button>
      </div>
      <div id="tournament-message" class="text-cyan-200 mt-4"></div>
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

function handleTournamentLogin(playerNum: number) {
  localStorage.setItem("tournament_login_player", playerNum.toString())
  navigateTo(`/loginTournament?player=${playerNum}&redirect=/pong`)
}

function showMatchModal(pseudo1: string, pseudo2: string, callback: () => void) {
  const modal = document.createElement("div");
  modal.id = "match-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0,0,0,0.7)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "9999";
  modal.innerHTML = `
    <div style="background:#0e2233;padding:2rem 3rem;border-radius:1rem;text-align:center;box-shadow:0 0 20px #000">
      <h2 style="color:#00e6e6;font-size:2rem;margin-bottom:1rem;">Match à venir</h2>
      <div style="font-size:1.5rem;color:#fff;margin-bottom:1rem;">
        <b>${pseudo1}</b> VS <b>${pseudo2}</b>
      </div>
      <div id="modal-countdown" style="font-size:2rem;color:#00e6e6;">10</div>
    </div>
  `;
  document.body.appendChild(modal);

  let seconds = 10;
  const countdown = setInterval(() => {
    seconds--;
    const el = document.getElementById("modal-countdown");
    if (el) el.textContent = seconds.toString();
    if (seconds <= 0) {
      clearInterval(countdown);
      modal.remove();
      callback();
    }
  }, 1000); 
}

export function gameEvent() {
  const root = document.getElementById('app')!
  let tournamentPlayers: { [k:number]: {token?: string, id?: number, login?: string} } = {}

  root.querySelector('#btn-local')?.addEventListener("click", () => {
    if (!localStorage.getItem("token_player2")) {
      navigateTo("/loginUser2?redirect=/pong")
      return
    }
    showOnly("keyConfig")
  })

  root.querySelector('#btn-ai')?.addEventListener("click", () => showOnly("ai"))
  root.querySelector('#btn-rules')?.addEventListener("click", () => showOnly("rules"))
  root.querySelector('#btn-settings')?.addEventListener("click", () => showOnly("settings"))
  root.querySelector('#btn-tournament')?.addEventListener("click", () => showOnly("tournament"))
  root.querySelector('#btn_tp2')?.addEventListener("click", () => handleTournamentLogin(2))
  root.querySelector('#btn_tp3')?.addEventListener("click", () => handleTournamentLogin(3))
  root.querySelector('#btn_tp4')?.addEventListener("click", () => handleTournamentLogin(4))

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

  root.querySelector('#btn-tst')?.addEventListener("click", () => {
    // Vérifie que les 4 joueurs sont connectés et uniques)
    const ids = [1,2,3,4].map(n => localStorage.getItem(`tournament_userId_${n}`))
    const tokens = [1,2,3,4].map(n => localStorage.getItem(`tournament_token_${n}`))
    const msg = document.getElementById("tournament-message")
    if (ids.some(id => !id) || tokens.some(t => !t)) {
      if (msg) 
        msg.textContent = "Tous les joueurs doivent être connectés."
      return
    }
    if (new Set(ids).size !== 4) {
      if (msg) 
        msg.textContent = "Chaque joueur doit avoir un compte unique."
      return
    }
    // Lance la configuration des touches pour le premier match
    localStorage.setItem("tournament_phase", "1")
    showOnly("keyConfig")
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
  root.querySelector('#btn-start-local')?.addEventListener("click", () => {
    if (localStorage.getItem("tournament_phase")) {
      // On est en tournoi, on affiche la modale avant de lancer le match
      const phase = Number(localStorage.getItem("tournament_phase") || "1")
      let pseudo1 = "Joueur 1", pseudo2 = "Joueur 2"
      if (phase === 1) {
        pseudo1 = localStorage.getItem("userLogin") || "Joueur 1"
        pseudo2 = localStorage.getItem("tournament_login_2") || "Joueur 2"
      } 
      else if (phase === 2) {
        pseudo1 = localStorage.getItem("tournament_login_3") || "Joueur 3"
        pseudo2 = localStorage.getItem("tournament_login_4") || "Joueur 4"
      } 
      else if (phase === 3) {
        const winner1 = localStorage.getItem("tournament_winner1")
        const winner2 = localStorage.getItem("tournament_winner2")
        pseudo1 = localStorage.getItem("tournament_login_" + (
          winner1 === localStorage.getItem("tournament_userId_1") ? "1" :
          winner1 === localStorage.getItem("tournament_userId_2") ? "2" :
          winner1 === localStorage.getItem("tournament_userId_3") ? "3" : "4"
        )) || "Vainqueur 1";
        pseudo2 = localStorage.getItem("tournament_login_" + (
          winner2 === localStorage.getItem("tournament_userId_1") ? "1" :
          winner2 === localStorage.getItem("tournament_userId_2") ? "2" :
          winner2 === localStorage.getItem("tournament_userId_3") ? "3" : "4"
        )) || "Vainqueur 2";
      }
      showMatchModal(pseudo1, pseudo2, () => startMatch())
    } 
    else
      startMatch()
  })

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
  let html = navbarView()
  switch (currentPanel) {
    case "menu":
      html += gameViews()
      break
    case "settings":
      html += renderPanelSettings()
      break
    case "ai":
      html += renderPanelAI()
      break
    case "keyConfig": 
      html += renderPanelKeys()
      break
    case "rules":
      html += renderPanelRules()
      break
    case "game":
      html += renderGame()
      break
    case "tournament":
      html += renderTournament()
      break
  }
  root.innerHTML = html
  gameEvent()
  attachNavbarEvents()
}

function showOnly(panel: Panel) {
  currentPanel = panel
  if (localStorage.getItem("returnToTournament")) {
    currentPanel = "tournament"
    localStorage.removeItem("returnToTournament")
  }
  renderUI()
}

function onKeyDownDuringBinding(e: KeyboardEvent) {
  if (!pendingBinding)
    return
  keyBinding[pendingBinding] = e.key
  pendingBinding = null
  window.removeEventListener("keydown", onKeyDownDuringBinding)
  document.getElementById("bind-p1-up-display")!.textContent = keyBinding.player1Up
  document.getElementById("bind-p1-down-display")!.textContent = keyBinding.player1Down
  document.getElementById("bind-p2-up-display")!.textContent = keyBinding.player2Up
  document.getElementById("bind-p2-down-display")!.textContent = keyBinding.player2Down
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
  let winner: "left" | "right" | null = null
  if (score.left === scoreMod)
    winner = "left"
  else if (score.right === scoreMod)
    winner = "right"

  const token1 = localStorage.getItem("token")
  const token2 = localStorage.getItem("token_player2")
  const user1_id = Number(localStorage.getItem("userId"))
  const user2_id = Number(localStorage.getItem("userId_player2"))

  if (mode === "ai") {
  fetch("/api/matchs/", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token1
    },
    body: JSON.stringify({
      date: new Date().toISOString(),
      duration: timerMod,
      winner_id: winner === "left" ? user1_id : null,
      score: `${score.left}-${score.right}`
    })
  }).catch(() => {})
  }
  else if (mode === "local" || mode === "tournoi") {
    fetch("/api/matchs/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token1
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        duration: timerMod,
        winner_id: winner === "left" ? user1_id : user2_id,
        score: `${score.left}-${score.right}`,
        player2_token: token2
      })
    }).catch(() => {})
  }
  alert('Time is up! Final Score: Left - ' + score.left + ', Right - ' + score.right)
  resetGame()
  showOnly("menu")
  if (localStorage.getItem("tournament_phase")) {
    const phase = Number(localStorage.getItem("tournament_phase"))
    if (phase === 1) {
      // Stocke le vainqueur du match 1
      localStorage.setItem("tournament_winner1", winner === "left"
        ? localStorage.getItem("tournament_userId_1")!
        : localStorage.getItem("tournament_userId_2")!)
      localStorage.setItem("tournament_winner1_token", winner === "left"
        ? localStorage.getItem("tournament_token_1")!
        : localStorage.getItem("tournament_token_2")!)
      localStorage.setItem("tournament_phase", "2")
      showOnly("keyConfig")
      return
    }
    if (phase === 2) {
      // Stocke le vainqueur du match 2
      localStorage.setItem("tournament_winner2", winner === "left"
        ? localStorage.getItem("tournament_userId_3")!
        : localStorage.getItem("tournament_userId_4")!)
      localStorage.setItem("tournament_winner2_token", winner === "left"
        ? localStorage.getItem("tournament_token_3")!
        : localStorage.getItem("tournament_token_4")!)
      localStorage.setItem("tournament_phase", "3")
      showOnly("keyConfig")
      return
    }
    if (phase === 3) {
      // Finale : winner1 vs winner2
      // Affiche le gagnant du tournoi ou recommence
      alert("Tournoi terminé !"), ["1","2","3","4","winner1","winner2","winner1_token","winner2_token","phase"].forEach(k => localStorage.removeItem("tournament_" + k))
      showOnly("menu")
      return
    }
  }
}

function update() {
  if (mode === "local") 
  {
    if (keyPressed[keyBinding.player2Up] && rightPaddle.y > 0)
      rightPaddle.y -= baseSpeed
    if (keyPressed[keyBinding.player2Down] && rightPaddle.y < canvas!.height-paddleHeight)
      rightPaddle.y += baseSpeed
  } 
  else
    aiStep()
  if (keyPressed[keyBinding.player1Up] && leftPaddle.y > 0)
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
  let pseudo1 = "Joueur 1"
  let pseudo2 = "Joueur 2"
  if (currentPanel === "tournament") {
    mode === "tournoi"
    const phase = Number(localStorage.getItem("tournament_phase") || "1")
    if (phase === 1) {
      // joueur 1 vs joueur 2
      localStorage.setItem("token", localStorage.getItem("tournament_token_1")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_userId_1")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_token_2")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_userId_2")!)
      pseudo1 = localStorage.getItem("userLogin") || "Joueur 1"
      pseudo2 = localStorage.getItem("tournament_login_2") || "Joueur 2"
    } 
    else if (phase === 2) {
      // joueur 3 vs joueur 4
      localStorage.setItem("token", localStorage.getItem("tournament_token_3")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_userId_3")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_token_4")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_userId_4")!)
      pseudo1 = localStorage.getItem("tournament_login_3") || "Joueur 3"
      pseudo2 = localStorage.getItem("tournament_login_4") || "Joueur 4"
    }
    else if (phase === 3) {
      localStorage.setItem("token", localStorage.getItem("tournament_winner1_token")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_winner1")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_winner2_token")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_winner2")!)
      pseudo1 = localStorage.getItem("tournament_login_" + (
        localStorage.getItem("tournament_winner1") === localStorage.getItem("tournament_userId_1") ? "1" : 
        localStorage.getItem("tournament_winner1") === localStorage.getItem("tournament_userId_2") ? "2" :
        localStorage.getItem("tournament_winner1") === localStorage.getItem("tournament_userId_3") ? "3" : "4"
      )) || "Vainqueur 1"
      pseudo2 = localStorage.getItem("tournament_login_" + (
        localStorage.getItem("tournament_winner2") === localStorage.getItem("tournament_userId_1") ? "1" : 
        localStorage.getItem("tournament_winner2") === localStorage.getItem("tournament_userId_2") ? "2" :
        localStorage.getItem("tournament_winner2") === localStorage.getItem("tournament_userId_3") ? "3" : "4"
      )) || "Vainqueur 2"
    }
  }
  else
    mode = (currentPanel === "ai") ? "ai" : "local"
  showOnly("game")
  initPaddle(canvas!)
  resetBall(canvas!)
  resetTimer()
  const timerGame = Math.max(10, timerMod)
  startTimer(timerGame)
  gameLoop()
}
/*
window.addEventListener("load", () => {
  renderUI()
})*/