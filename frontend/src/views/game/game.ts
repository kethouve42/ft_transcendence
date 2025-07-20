import { paddleHeight, paddleWidth, leftPaddle, rightPaddle, drawRectangle, initPaddle } from './paddle.js'
import { ballSize, speed as baseSpeed, ball, drawBall, resetBall } from './ball.js'
import { score, drawScore } from './score.js'
import { timer, drawTimer, startTimer, resetTimer } from './timer.js'
import { updatePowerUps, drawPowerUp } from "./power_up.js"
import { navbarView, attachNavbarEvents } from '../navbar.js'
import { renderPanelFinalScoreTable, Score } from './loginTournament.js'
import { renderPanelResult, attachResultEvents, handleTournamentLogin } from './loginTournament.js'
import { aiStep } from './ai_logic.js'
import { t } from "../../i18n/index.js"
import { navigateTo } from '../../main.js'
import "../../css/style.css"

type Panel =  "menu" | "settings" | "ai" | "keyConfig" | "rules" | "game" | "tournament"

let mode: 'local' | 'ai' | 'tournoi' = 'local'
const epsilon = 0.5 // Constante pour les calculs de collision pour éviter que la balle coince.
export let aiDifficulty: 'easy' | 'medium' | 'hard' = 'easy'
let ballSpeed = baseSpeed
let timerMod = 10
let scoreMod = 10
let powerUpsEnabled = false;
let previousPanel: Panel | null = null;

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
export let lastAiUpdate = Date.now()
export let previousTargetY = 0
export let nextTargetY = 0

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D

// Chargement des settings sauvegardés
if (localStorage.getItem("pong_ballSpeed")) ballSpeed = +localStorage.getItem("pong_ballSpeed")!
if (localStorage.getItem("pong_timerMod")) timerMod = +localStorage.getItem("pong_timerMod")!
if (localStorage.getItem("pong_scoreMod")) scoreMod = +localStorage.getItem("pong_scoreMod")!
if (localStorage.getItem("pong_powerUpsEnabled")) powerUpsEnabled = localStorage.getItem("pong_powerUpsEnabled") === "1"
if (localStorage.getItem("pong_keyBinding")) keyBinding = JSON.parse(localStorage.getItem("pong_keyBinding")!)

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
      <button id="btn-tournament" class="menu-btn">${t("menu.tournament")}</button>
      <button id="btn-ai" class="menu-btn">${t("menu.play_ai")}</button>
      <button id="btn-rules" class="menu-btn">${t("menu.rules")}</button>
      <button id="btn-settings" class="menu-btn">${t("menu.settings")}</button>
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
              ${t("rules.effects.slower")}
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
            ${t("settings.speed")} <span id="display-ball-speed">${ballSpeed}</span>
          </label>
          <input
            type="range"
            id="input-ball-speed"
            min="1" max="20"
            value="${ballSpeed}"
            class="w-full"
          />
        </div>
        <div class="settings-timer">
          <label class="settings-label"></label>
            ${t("settings.time")} <span id="display-timer-mod">${timerMod}</span>
          <input
            type="number"
            id="input-timer-mod"
            min="10" max="300"
            value="${timerMod}"
            class="ml-2 w-20 p-1 bg-gray-800 rounded"
          />
        </div>
        <div class="settings-score">
          <label class="settings-label"></label>
            ${t("settings.points")} <span id="display-score-mod">${scoreMod}</span>
          <input
            type="number"
            id="input-score-mod"
            min="1"
            value="${scoreMod}"
            class="ml-2 w-20 p-1 bg-gray-800 rounded"
          />
        </div>
        <div class="settings-powerup">
          <label class="settings-label">
            Power-ups
            <input type="checkbox" id="input-powerup-enabled" ${powerUpsEnabled ? "checked" : ""} />
          </label>
        </div>
      </div>
      <div class="settings-actions">
        <button id="btn-keyconfig" class="menu-btn save-btn">Modifier les contrôles</button>
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
            <span id="bind-p1-up-display">${keyBinding.player1Up}</span>
          </button>
        </div>
        <div>
          <label>${t("local.down1")}</label>
          <button id="btn-bind-p1-down" class="menu-btn save-btn">
            <span id="bind-p1-down-display">${keyBinding.player1Down}</span>
          </button>
        </div>
        <div>
          <label>${t("local.up2")}</label>
          <button id="btn-bind-p2-up" class="menu-btn save-btn">
            <span id="bind-p2-up-display">${keyBinding.player2Up}</span>
          </button>
        </div>
        <div>
          <label>${t("local.down2")}</label>
          <button id="btn-bind-p2-down" class="menu-btn save-btn">
            <span id="bind-p2-down-display">${keyBinding.player2Down}</span>
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
  const login1 = localStorage.getItem("tournament_login_1") || "Joueur 1"
  const login2 = localStorage.getItem("tournament_login_2") || "Joueur 2"
  const login3 = localStorage.getItem("tournament_login_3") || "Joueur 3"
  const login4 = localStorage.getItem("tournament_login_4") || "Joueur 4"
  return `
    <div class="settings-panel">
      <h1>${t("tournament.title")}</h1>
      <div class="settings-grid">
        <button id="btn_tp1" class="menu-btn">${login1}</button>
        <button id="btn_tp2" class="menu-btn">${login2}</button>
        <button id="btn_tp3" class="menu-btn">${login3}</button>
        <button id="btn_tp4" class="menu-btn">${login4}</button>
      </div>
      <div class="settings-action">
        <button id="btn-tst" class="menu-btn save-btn">${t("tournament.start")}</button>
        <button id="btn-tc" class="menu-btn save-btn">${t("tournament.cancel")}</button>
      </div>
      <div id="tournament-message" class="text-cyan-200 mt-4"></div>
    </div>
  `
}

function renderPanelMatchVersus(pseudo1: string, pseudo2: string, countdownSeconds = 5): string {
  return `
    <div id="match-modal" class="modal-overlay">
      <div class="modal-card">
        <h2 class="modal-title">${t("tournament.upcoming_match")}</h2>
        <div class="modal-body">
          <span class="player-name">${pseudo1}</span>
          <span class="vs">VS</span>
          <span class="player-name">${pseudo2}</span>
        </div>
        <div id="modal-countdown" class="modal-countdown">${countdownSeconds}</div>
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

export function showOnly(panel: Panel) {
  previousPanel = currentPanel;
  currentPanel = panel
  renderUI()
}

function showMatchVersus(pseudo1: string, pseudo2: string, callback: () => void) {
  document.body.insertAdjacentHTML(
    "beforeend",
    renderPanelMatchVersus(pseudo1, pseudo2, 5)
  )

  let seconds = 5
  const countdownEl = document.getElementById("modal-countdown")!
  const modalEl = document.getElementById("match-modal")!

  const interval = setInterval(() => {
    seconds--
    countdownEl.textContent = String(seconds)
    if (seconds <= 0) {
      clearInterval(interval)
      modalEl.remove()
      callback()
    }
  }, 1000)
}

export function gameEvent() {
  const root = document.getElementById('app')!

  root.querySelector('#btn-local')?.addEventListener("click", () => {
    if (!localStorage.getItem("token_player2")) {
      navigateTo("/loginUser2?redirect=/pong")
      return
    }
    showOnly("keyConfig")
  })

  root.querySelector('#input-powerup-enabled')?.addEventListener("change", e => {
  powerUpsEnabled = (e.target as HTMLInputElement).checked;
  });

  root.querySelector('#btn-ai')?.addEventListener("click", () => showOnly("ai"))
  root.querySelector('#btn-rules')?.addEventListener("click", () => showOnly("rules"))
  root.querySelector('#btn-settings')?.addEventListener("click", () => showOnly("settings"))
  root.querySelector('#btn-tournament')?.addEventListener("click", () => showOnly("tournament"))
  root.querySelector('#btn_tp1')?.addEventListener("click", () => handleTournamentLogin(1))
  root.querySelector('#btn_tp2')?.addEventListener("click", () => handleTournamentLogin(2))
  root.querySelector('#btn_tp3')?.addEventListener("click", () => handleTournamentLogin(3))
  root.querySelector('#btn_tp4')?.addEventListener("click", () => handleTournamentLogin(4))

  root.querySelector('#btn-close-settings')?.addEventListener("click", () => showOnly("menu"))
  root.querySelector('#btn-close-ai')?.addEventListener("click", () => showOnly("menu"))
  root.querySelector('#btn-close-rules')?.addEventListener("click", () => showOnly("menu"))
  root.querySelector('#btn-cancel-keyconfig')?.addEventListener("click", () => {
    showOnly(previousPanel || "menu");
  });
  root.querySelector('#btn-keyconfig')?.addEventListener("click", () => showOnly("keyConfig"))

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
    // Sauvegarde les settings dans le localStorage
    localStorage.setItem("pong_ballSpeed", ballSpeed.toString())
    localStorage.setItem("pong_timerMod", timerMod.toString())
    localStorage.setItem("pong_scoreMod", scoreMod.toString())
    localStorage.setItem("pong_powerUpsEnabled", powerUpsEnabled ? "1" : "0")
    localStorage.setItem("pong_keyBinding", JSON.stringify(keyBinding))
    showOnly("menu")
  })

  root.querySelector('#btn-tst')?.addEventListener("click", () => {
    // Vérifie que les 4 joueurs sont connectés et uniques
    const ids = [1,2,3,4].map(n => localStorage.getItem(`tournament_userId_${n}`))
    const tokens = [1,2,3,4].map(n => localStorage.getItem(`tournament_token_${n}`))
    const msg = document.getElementById("tournament-message")
    if (ids.some(id => !id) || tokens.some(t => !t)) {
      if (msg) 
        msg.textContent = `${t("tournament.login_page.all_con")}`
      return
    }
    if (new Set(ids).size !== 4) {
      if (msg) 
        msg.textContent = `${t("tournament.login_page.err_2same")}`
      return
    }
    // Lance la configuration des touches pour le premier match
    localStorage.setItem("tournament_phase", "1")
    showOnly("keyConfig")
  })

  root.querySelector('#btn-tc')?.addEventListener("click", () => showOnly("menu"))
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
        pseudo1 = localStorage.getItem("tournament_login_1") || "Joueur 1"
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
        )) || "Vainqueur 1"
        pseudo2 = localStorage.getItem("tournament_login_" + (
          winner2 === localStorage.getItem("tournament_userId_1") ? "1" :
          winner2 === localStorage.getItem("tournament_userId_2") ? "2" :
          winner2 === localStorage.getItem("tournament_userId_3") ? "3" : "4"
        )) || "Vainqueur 2"
      }
      showMatchVersus(pseudo1, pseudo2, () => startMatch())
    }
	else if (previousPanel === "settings")
    	showOnly("settings");
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
  localStorage.setItem("pong_keyBinding", JSON.stringify(keyBinding))
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

async function endGame() {
  let winner: "left" | "right" | null = null
  if (score.left === scoreMod)
    winner = "left"
  else if (score.right === scoreMod)
    winner = "right"
  else if (score.left > score.right)
    winner = "left"
  else if (score.right > score.left)
    winner = "right"

  if (mode === "tournoi") {
    const phase = Number(localStorage.getItem("tournament_phase") || "1")
    if (phase === 1) {
      localStorage.setItem("token", localStorage.getItem("tournament_token_1")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_userId_1")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_token_2")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_userId_2")!)
    }
    else if (phase === 2) {
      localStorage.setItem("token", localStorage.getItem("tournament_token_3")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_userId_3")!)
      localStorage.setItem("token_player2",localStorage.getItem("tournament_token_4")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_userId_4")!)
    }
    else if (phase === 3) {
      localStorage.setItem("token", localStorage.getItem("tournament_winner1_token")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_winner1")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_winner2_token")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_winner2")!)
    }
  }

  const token1 = localStorage.getItem("token")
  const token2 = localStorage.getItem("token_player2")
  const user1_id = Number(localStorage.getItem("userId"))
  const user2_id = Number(localStorage.getItem("userId_player2"))
  const winnerID = winner === "left" ? user1_id : winner === "right" ? user2_id : null
  const scoreStr = `${score.left}-${score.right}`

  const payload: Record<string, any> = {
    date: new Date().toISOString(),
    duration: timerMod,
    winner_id: winnerID,
    score: scoreStr,
  }
  if (mode !== "ai" && token2)
    payload.player2_token = token2

  try {
    await fetch("/api/matchs/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token1
      },
      body: JSON.stringify(payload)
    })
  }
  catch (err) {
    console.error("Erreur lors de l'enregistrement du match:", err)
  }
  document.body.insertAdjacentHTML("beforeend", renderPanelResult())
  attachResultEvents()
  resetGame()
  showOnly("menu")
  localStorage.removeItem("token_player2")

  if (localStorage.getItem("tournament_phase")) {
    const phase = Number(localStorage.getItem("tournament_phase") || "1")
    if (phase === 1) {
      // → Match 1 : joueur 1 vs joueur 2
      const winnerUserId = winner === "left"
        ? localStorage.getItem("tournament_userId_1")!
        : localStorage.getItem("tournament_userId_2")!
      const winnerToken = winner === "left"
        ? localStorage.getItem("tournament_token_1")!
        : localStorage.getItem("tournament_token_2")!
      localStorage.setItem("tournament_winner1", winnerUserId)
      localStorage.setItem("tournament_winner1_token", winnerToken)
      localStorage.setItem("tournament_phase", "2")
      showOnly("keyConfig")
      return
    }
    if (phase === 2) {
      // → Match 2 : joueur 3 vs joueur 4
      const winnerUserId = winner === "left"
        ? localStorage.getItem("tournament_userId_3")!
        : localStorage.getItem("tournament_userId_4")!
      const winnerToken = winner === "left"
        ? localStorage.getItem("tournament_token_3")!
        : localStorage.getItem("tournament_token_4")!
  
      localStorage.setItem("tournament_winner2", winnerUserId)
      localStorage.setItem("tournament_winner2_token", winnerToken)
      localStorage.setItem("tournament_phase", "3")
      showOnly("keyConfig")
      return
    }
    if (phase === 3) {
      // Récupère tous les logins
      const login1 = localStorage.getItem("tournament_login_1")!
      const login2 = localStorage.getItem("tournament_login_2")!
      const login3 = localStorage.getItem("tournament_login_3")!
      const login4 = localStorage.getItem("tournament_login_4")!
        
      // On sait que tournament_winner1/_2 contiennent les userId des demi‑finalistes gagnants
      const winnerSemi1Id = localStorage.getItem("tournament_winner1")!
      const winnerSemi2Id = localStorage.getItem("tournament_winner2")!
        
      // Mappe userId → login
      const idToLogin: Record<string,string> = {
        [localStorage.getItem("tournament_userId_1")!]: login1,
        [localStorage.getItem("tournament_userId_2")!]: login2,
        [localStorage.getItem("tournament_userId_3")!]: login3,
        [localStorage.getItem("tournament_userId_4")!]: login4,
      }
        
      // Pseudos des demi‑finalistes gagnants
      const semi1Winner = idToLogin[winnerSemi1Id]
      const semi2Winner = idToLogin[winnerSemi2Id]
        
      // Perdants des demi‑finales
      const loserSemi1 = [login1, login2].find(p => p !== semi1Winner)!
      const loserSemi2 = [login3, login4].find(p => p !== semi2Winner)!
      
      // Dans la finale, `winner` est "left" ou "right"
      const finalWinner   = winner === "left"  ? semi1Winner : semi2Winner
      const finalRunnerUp = winner === "left"  ? semi2Winner : semi1Winner
        
      // Construit le tableau dans l’ordre voulu
      const finalScores: Score[] = [
        { player: finalWinner,   score: 1 },
        { player: finalRunnerUp, score: 2 },
        { player: loserSemi2,    score: 3 },
        { player: loserSemi1,    score: 3 },
      ]

      const modalHtml = renderPanelFinalScoreTable(finalScores)
      document.body.insertAdjacentHTML("beforeend", modalHtml)

      const modal = document.getElementById("score-modal")
      const btn = document.getElementById("btn-next-result_rank")
      btn?.addEventListener("click", () => {
        modal?.remove()
        setTimeout(() => {showOnly("menu")})
      })

      const oriToken = localStorage.getItem("tournament_original_token")
      const oriUser = localStorage.getItem("tournament_original_userId")
      if (oriToken)
        localStorage.setItem("token", oriToken)
      if (oriUser)
        localStorage.setItem("userId", oriUser)

      const keysToRemove = [
        "tournament_userId_1", "tournament_userId_2", "tournament_userId_3", "tournament_userId_4",
        "tournament_token_1",  "tournament_token_2",  "tournament_token_3",  "tournament_token_4",
        "tournament_login_1", "tournament_login_2",  "tournament_login_3",  "tournament_login_4", "tournament_winner1", 
        "tournament_winner1_token", "tournament_winner2", "tournament_winner2_token", "tournament_phase", "tournament_original_token",
        "tournament_original_userId"
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))
      return
    }
  }
}
//----------------------------------INIT DES VARIABLE FPS----------------------------------------//

const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;
let lastFrameTime = 0;

//-----------------------------------------------------------------------------------------------//

function update() {
  if (mode === "ai")
    aiStep(canvas)
  else {
    if (keyPressed[keyBinding.player2Up] && rightPaddle.y > 0)
      rightPaddle.y -= baseSpeed
    if (keyPressed[keyBinding.player2Down] && rightPaddle.y < canvas!.height-paddleHeight)
      rightPaddle.y += baseSpeed
  }
  if (keyPressed[keyBinding.player1Up] && leftPaddle.y > 0)
    leftPaddle.y -= baseSpeed
  if (keyPressed[keyBinding.player1Down] && leftPaddle.y < canvas!.height-paddleHeight)
    leftPaddle.y += baseSpeed

  if (powerUpsEnabled) {
    updatePowerUps(Date.now(), canvas!.width, canvas!.height, ball);
  }
  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.y <= 0 || ball.y >= canvas!.height - ballSize)
    ball.vy = -ball.vy

  // Collision avec la raquette de gauche
  if (
    ball.x <= leftPaddle.x + paddleWidth &&
    ball.x + ballSize >= leftPaddle.x &&
    ball.y + ballSize > leftPaddle.y + epsilon &&
    ball.y < leftPaddle.y + paddleHeight - epsilon
  ) {
	//-----------------------OLD--------------------------//
	//ball.x = leftPaddle.x + paddleWidth
    //ball.vx = Math.abs(ball.vx)
	//----------------------------------------------------//
	//-----------------------REMPLACEMENT DE L'ANCIEN CALCUL DE LA BALLE----------------------------------//
    ball.x = leftPaddle.x + paddleWidth;
    handlePaddleCollision(ball, leftPaddle);
	//----------------------------------------------------------------------------------------------------//
  }

  // Collision avec la raquette de droite
  if (
    ball.x + ballSize >= rightPaddle.x &&
    ball.x <= rightPaddle.x + paddleWidth &&
    ball.y + ballSize > rightPaddle.y + epsilon &&
    ball.y < rightPaddle.y + paddleHeight - epsilon
  ) {
	//-----------------------OLD--------------------------//
	//ball.x = rightPaddle.x - ballSize
    //ball.vx = -Math.abs(ball.vx)
	//----------------------------------------------------//
	//-----------------------REMPLACEMENT DE L'ANCIEN CALCUL DE LA BALLE----------------------------------//
    ball.x = rightPaddle.x - ballSize;
    handlePaddleCollision(ball, rightPaddle);
	//----------------------------------------------------------------------------------------------------//
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
      if (mode === "tournoi" || mode === "local")
        if (score.left === score.right) {
          startTimer(10)
          return
        }
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
  if (powerUpsEnabled) {
    drawPowerUp(ctx!);
  }
  drawScore(ctx!, canvas!)
  drawTimer(ctx!, canvas!)
}

//--------------------------------OLD------------------------------//
/*function gameLoop() {
  update()
  render()
  if (timer.isRunning)
    requestAnimationFrame(gameLoop)
}*/
//-----------------------------------------------------------------//
//----------------------------------CHANGEMENT DE GAME LOOP POUR LE CALCUL DE LA LOOP SUR LES FPS---------------------------//
function gameLoop(now = performance.now()) {
  if (!timer.isRunning) return;

  if (now - lastFrameTime >= FRAME_DURATION) {
    update();
    render();
    lastFrameTime = now;
  }
  requestAnimationFrame(gameLoop);
}
//--------------------------------------------------------------------------------------------------------------------------//

function startMatch() {
  let pseudo1 = "Joueur 1"
  let pseudo2 = "Joueur 2"  
  const phaseStr = localStorage.getItem("tournament_phase")
  if (phaseStr) {
    mode = "tournoi"
    const phase = Number(phaseStr)

    if (phase === 1 && !localStorage.getItem("tournament_original_token")) {
      localStorage.setItem("tournament_original_token", localStorage.getItem("token")!)
      localStorage.setItem("tournament_original_userId", localStorage.getItem("userId")!)
    }

    if (phase === 1) {
      mode = "tournoi"
      // joueur 1 vs joueur 2
      localStorage.setItem("token", localStorage.getItem("tournament_token_1")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_userId_1")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_token_2")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_userId_2")!)
      pseudo1 = localStorage.getItem("tournament_login_1") || "Joueur 1"
      pseudo2 = localStorage.getItem("tournament_login_2") || "Joueur 2"
    } 
    else if (phase === 2) {
      mode = "tournoi"
      // joueur 3 vs joueur 4
      localStorage.setItem("token", localStorage.getItem("tournament_token_3")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_userId_3")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_token_4")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_userId_4")!)
      pseudo1 = localStorage.getItem("tournament_login_3") || "Joueur 3"
      pseudo2 = localStorage.getItem("tournament_login_4") || "Joueur 4"
    }
    else if (phase === 3) {
      mode = "tournoi"
      // joueur gagnant 1 vs joueur gagnant 2
      localStorage.setItem("token", localStorage.getItem("tournament_winner1_token")!)
      localStorage.setItem("userId", localStorage.getItem("tournament_winner1")!)
      localStorage.setItem("token_player2", localStorage.getItem("tournament_winner2_token")!)
      localStorage.setItem("userId_player2", localStorage.getItem("tournament_winner2")!)
      pseudo1 = localStorage.getItem("tournament_winner1") || "Joueur 1"
      pseudo2 = localStorage.getItem("tournament_winner2") || "Joueur 2"
    }
  }
  else
    mode = (currentPanel === "ai") ? "ai" : "local"

  showOnly("game")
  canvas = document.getElementById("pong") as HTMLCanvasElement
  ctx = canvas.getContext("2d")!
  initPaddle(canvas)
  resetBall(canvas)
  resetTimer()
  const timerGame = Math.max(10, timerMod)
  startTimer(timerGame)
  //-------------------------------------REMPLACEMENT CALCULÉ SUR LES FPS-----------------------------------------------//
  lastFrameTime = performance.now();
  //--------------------------------------------------------------------------------------------------------------------//
  gameLoop();
}

// window.addEventListener("load", () => {
//   if (localStorage.getItem("returnToTournament")) {
//     localStorage.removeItem("returnToTournament")
//     showOnly("tournament")
//   }
//   else
//     showOnly("menu")
// })

//----------------------------------NOUVELLE FONCTION POUR LE CALCUL DE L'ANGLE DE LA BALLE-----------------------------//
function handlePaddleCollision(
  ball: { x: number; y: number; vx: number; vy: number },
  paddle: { x: number; y: number }
) {
  const paddleCenter = paddle.y + paddleHeight / 2;
  const ballCenter = ball.y + ballSize / 2;
  const relativeIntersectY = ballCenter - paddleCenter;
  const normalized = Math.max(-1, Math.min(1, relativeIntersectY / (paddleHeight / 2)));

  // Définit un angle maximal (ex: 60°)
  const maxBounceAngle = Math.PI / 3;
  const bounceAngle = normalized * maxBounceAngle;

  // Détermine la direction (gauche ou droite)
  const direction = ball.vx > 0 ? -1 : 1;

  // Met à jour vx et vy selon l'angle de rebond
  ball.vx = Math.cos(bounceAngle) * ballSpeed * direction;
  ball.vy = Math.sin(bounceAngle) * ballSpeed;
}
//---------------------------------------------------------------------------------------------------------------------//