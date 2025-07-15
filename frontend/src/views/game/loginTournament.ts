import { t } from "../../i18n"
import { showOnly } from "./game"
import "../../css/style.css"
import { score } from "./score"
import { navigateTo } from "../../main"

export function loginTournamentView(): string {
  const playerParam = new URLSearchParams(window.location.search).get("player")
  if (!playerParam) {
    throw new Error("Numéro de joueur de tournoi manquant dans l'URL")
  }
  const playerNum = Number(playerParam)
    return `
    <div class="settings-panel">
      <h2> ${t("tournament.login_page.title")} ${playerNum} </h2>
        <form id="tournament-login-form" class="flex flex-col gap-4">
        <input type="text" name="login" placeholder="${t("login.username")}" required class="input" />
          <input type="password" name="password" placeholder="${t("login.password")}" required class="input" />
          <button type="submit" class="menu-btn save-btn">${t("login.submit")}</button>
          <div id="tournament-login-message" class="text-cyan-200"></div>
          </form>
        <a href="/register" class="text-cyan-400 underline mt-4 inline-block">${t("login.register")}</a>
    </div>
    `
}
  
export function attachLoginTournamentEvents() {
  const form = document.getElementById("tournament-login-form") as HTMLFormElement | null
  const msg = document.getElementById("tournament-login-message")
  const playerParam = new URLSearchParams(window.location.search).get("player")
  if (!playerParam) {
    throw new Error("Numéro de joueur de tournoi manquant dans l'URL")
  }
  const playerNum = Number(playerParam)
  if (!form) 
    return

  form.onsubmit = async (e) => {
      e.preventDefault()
      if (msg) 
          msg.textContent = ""
      const login = (form.login as HTMLInputElement).value
      const password = (form.password as HTMLInputElement).value
    try {
      const res = await fetch("/api/users/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: login, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        if (msg) 
          msg.textContent = data.error || "Erreur de connexion"
        return
      }
      // Stocke le token et l'id pour ce joueur de tournoi
      localStorage.setItem(`tournament_token_${playerNum}`, data.token)
      if (data.UserId)
        localStorage.setItem(`tournament_userId_${playerNum}`, data.UserId.toString())
      if (data.login)
        localStorage.setItem(`tournament_login_${playerNum}`, data.login)
      if (msg) msg.textContent = `${t("tournament.con")}`
      setTimeout(() => {
        // Redirige vers la page tournoi
        showOnly("tournament")
      }, 500)
    } 
    catch (err: any) {
      if (msg) msg.textContent = "Erreur lors de la connexion : " + err.message
    }
  }
}

export interface Score {
  player: string
  score: number
}

export function renderPanelFinalScoreTable(scores: Score[]): string {
  const sorted = [...scores].sort((a, b) => a.score - b.score)

  const rows = sorted.map(s => `
    <tr>
      <td class="player-cell">${s.player}</td>
      <td class="rank-cell">${s.score}</td>
    </tr>
  `).join("")


  return `
    <div id="score-modal" class="score-modal-overlay">
      <div class="score-modal-card">
        <h2 class="modal-title">${t("tournament.score.final_results")}</h2>
        <table class="score-table">
          <thead>
            <tr>
              <th>${t("tournament.score.player")}</th>
              <th>${t("tournament.score.score")}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="btn-start-local">
          <button id="btn-next-result_rank" class="menu-btn save-btn">
            ${t("popup_result.next")}
          </button>
        </div>
      </div>
    </div>
  `
}

export function renderPanelResult(): string {
  const left = score.left
  const right = score.right

  return `
    <div id="result-modal" class="result-modal-overlay">
      <div class="result-modal-card">
        <h2 class="modal-title">${t("popup_result.title")}</h2>

        <div class="result-modal-body">
          <p class="result-text">
            ${t("popup_result.score_left")} ${score.left} ${t("popup_result.score_right")} ${score.right}
          </p>
        </div>

        <div class="btn-start-local">
          <button id="btn-next-result" class="menu-btn save-btn">
            ${t("popup_result.next")}
          </button>
        </div>
      </div>
    </div>
  `
}

export function attachResultEvents() {
  const modal = document.getElementById('result-modal')
  const btn = document.getElementById('btn-next-result')
  btn?.addEventListener("click", () => {
    modal?.remove()
  })
}

export function handleTournamentLogin(playerNum: number) {
  if (playerNum === 1) {
    localStorage.setItem("tournament_userId_1", localStorage.getItem("userId")!)
    localStorage.setItem("tournament_token_1", localStorage.getItem("token")!)
    localStorage.setItem("tournament_login_1", localStorage.getItem("userLogin")!)
    showOnly("tournament")
    return
  }
  localStorage.setItem("tournament_login_player", playerNum.toString())
  navigateTo(`/loginTournament?player=${playerNum}&redirect=/pong`)
}

export function clearTournamentData() {
  localStorage.removeItem("token_player2")
  // Purge les joueurs 1–4 et l’état du tournoi
  for (let i = 1; i <= 4; i++) {
    localStorage.removeItem(`tournament_login_${i}`)
    localStorage.removeItem(`tournament_userId_${i}`)
    localStorage.removeItem(`tournament_token_${i}`)
  }
  localStorage.removeItem("tournament_phase")
  localStorage.removeItem("tournament_winner1")
  localStorage.removeItem("tournament_winner2")
  localStorage.removeItem("returnToTournament")
}