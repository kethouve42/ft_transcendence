import { t } from "../../i18n"
import { showOnly } from "./game"
import "../../css/style.css"
import { score } from "./score"
import { navigateTo } from "../../main"
import type { Panel } from "./game"

export function loginTournamentView(): string {
  const playerParam = new URLSearchParams(window.location.search).get("player")
  if (!playerParam) {
    throw new Error("Numéro de joueur de tournoi manquant dans l'URL")
  }
  const playerNum = Number(playerParam)
    return `
    <div class="settings-panel">
      <h2> ${t("tournament.login_page.title")} ${playerNum} </h2>
        <form id="tournament-login-form" class="mdp">
        <input type="text" name="login" placeholder="${t("login.username")}" required class="input" />
          <input type="password" name="password" placeholder="${t("login.password")}" required class="input" />
          <button type="submit" class="menu-btn save-btn">${t("login.submit")}</button>
          <div id="tournament-login-message" class="text-cyan-200"></div>
          </form>
        <a href="/register" class="register-container">${t("login.register")}</a>
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
  const sorted = scores.slice().sort((a, b) => a.score - b.score)

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
  // Purge les joueurs 1–8 et l’état du tournoi
  for (let i = 1; i <= 8; i++) {
    localStorage.removeItem(`tournament_login_${i}`)
    localStorage.removeItem(`tournament_userId_${i}`)
    localStorage.removeItem(`tournament_token_${i}`)
  }
  for (let i = 1; i <= 7; i++) {
    localStorage.removeItem(`tournament_winner${i}`)
    localStorage.removeItem(`tournament_winner${i}_token`)
    localStorage.removeItem(`tournament_loser${i}`)
  }
  localStorage.removeItem("tournament_phase")
  localStorage.removeItem("tournament_player_count")
  localStorage.removeItem("tournament_original_token")
  localStorage.removeItem("tournament_original_userId")
  localStorage.removeItem("returnToTournament")
}

export function handleTournamentProgress(winner: "left" | "right", showOnly: (panel: Panel) => void) {
  const playerCount = Number(localStorage.getItem("tournament_player_count") || "4")
  let phase = Number(localStorage.getItem("tournament_phase") || "1")
  // 4 joueurs : phases 1 (1v2), 2 (3v4), 3 (demi-finale)
  if (playerCount === 4) {
    if (phase === 1) {
      const winnerUserId = winner === "left" ? localStorage.getItem("tournament_userId_1") || "" : localStorage.getItem("tournament_userId_2") || ""
      const winnerToken = winner === "left" ? localStorage.getItem("tournament_token_1") || "" : localStorage.getItem("tournament_token_2") || ""
      console.log(winnerToken)
      console.log(winnerUserId)
      localStorage.setItem("tournament_winner1", winnerUserId)
      localStorage.setItem("tournament_winner1_token", winnerToken)
      localStorage.setItem("tournament_phase", "2")
      showOnly("keyConfig")
      return
    }
    if (phase === 2) {
      const winnerUserId = winner === "left" ? localStorage.getItem("tournament_userId_1") || "" : localStorage.getItem("tournament_userId_2") || ""
      const winnerToken = winner === "left" ? localStorage.getItem("tournament_token_1") || "" : localStorage.getItem("tournament_token_2") || ""
      localStorage.setItem("tournament_winner2", winnerUserId)
      localStorage.setItem("tournament_winner2_token", winnerToken)
      localStorage.setItem("tournament_phase", "3")
      showOnly("keyConfig")
      return
    }
    if (phase === 3) {
      // Finale et classement
      const login1 = localStorage.getItem("tournament_login_1") || ""
      const login2 = localStorage.getItem("tournament_login_2") || ""
      const login3 = localStorage.getItem("tournament_login_3") || ""
      const login4 = localStorage.getItem("tournament_login_4") || ""
      const winnerSemi1Id = localStorage.getItem("tournament_winner1")!
      const winnerSemi2Id = localStorage.getItem("tournament_winner2")!

      // Permet d'associer les id au login.
      const idToLogin: Record<string, string> = {
        [localStorage.getItem("tournament_userId_1")!]: login1,
        [localStorage.getItem("tournament_userId_2")!]: login2,
        [localStorage.getItem("tournament_userId_3")!]: login3,
        [localStorage.getItem("tournament_userId_4")!]: login4,
      }

      // Construit le tableau des scores
      const semi1Winner = idToLogin[winnerSemi1Id]
      const semi2Winner = idToLogin[winnerSemi2Id]
      const loserSemi1 = [login1, login2].find(p => p !== semi1Winner)!
      const loserSemi2 = [login3, login4].find(p => p !== semi2Winner)!
      const finalWinner = winner === "left" ? semi1Winner : semi2Winner
      const second = winner === "left" ? semi2Winner : semi1Winner
      const finalScores: Score[] = [
        { player: finalWinner, score: 1 },
        { player: second, score: 2 },
        { player: loserSemi2, score: 3 },
        { player: loserSemi1, score: 3 },
      ]
      const modalHtml = renderPanelFinalScoreTable(finalScores)
      document.body.insertAdjacentHTML("beforeend", modalHtml)
      const modal = document.getElementById("score-modal")
      const btn = document.getElementById("btn-next-result_rank")
      btn?.addEventListener("click", () => {
        modal?.remove()
        setTimeout(() => { showOnly("menu") })
      });
      [
        "tournament_userId_1", "tournament_token_1", "tournament_login_1",
        "tournament_userId_2", "tournament_token_2", "tournament_login_2",
        "tournament_userId_3", "tournament_token_3", "tournament_login_3",
        "tournament_userId_4", "tournament_token_4", "tournament_login_4",
        "tournament_winner1","tournament_winner1_token","tournament_winner2","tournament_winner2_token",
        "tournament_phase","tournament_original_token","tournament_original_userId"
      ].forEach(key=>localStorage.removeItem(key))
      return
    }
  }
  // 8 joueurs : phases 1-4 (quarts), 5-6 (demis), 7 (finale)
  if (playerCount === 8) {
    // Quarts de finale
    if (phase >= 1 && phase <= 4) {
      // Matchs : 1v2, 3v4, 5v6, 7v8
      const player_idA = (phase - 1) * 2 + 1
      const player_idB = player_idA + 1
      const winnerUserId = winner === "left" ? localStorage.getItem(`tournament_userId_${player_idA}`) || "" : localStorage.getItem(`tournament_userId_${player_idB}`) || ""
      const winnerToken = winner === "left" ? localStorage.getItem(`tournament_token_${player_idA}`) || "" : localStorage.getItem(`tournament_token_${player_idB}`) || ""
      localStorage.setItem(`tournament_winner${phase}`, winnerUserId)
      localStorage.setItem(`tournament_winner${phase}_token`, winnerToken)
      if (phase < 4) {
        localStorage.setItem("tournament_phase", (phase + 1).toString())
        showOnly("keyConfig")
        return
      } else {
        localStorage.setItem("tournament_phase", "5")
        showOnly("keyConfig")
        return
      }
    }
    // Demi-finales
    if (phase === 5 || phase === 6) {
      // Demi 1: winner1 vs winner2, Demi 2: winner3 vs winner4
      const player_idA = (phase - 4) * 2 - 1
      const player_idB = player_idA + 1
      const winnerA = localStorage.getItem(`tournament_winner${player_idA}`)!
      const winnerB = localStorage.getItem(`tournament_winner${player_idB}`)!
      const winnerA_token = localStorage.getItem(`tournament_winner${player_idA}_token`)!
      const winnerB_token = localStorage.getItem(`tournament_winner${player_idB}_token`)!
      const winnerUserId = winner === "left" ? winnerA : winnerB
      const winnerToken = winner === "left" ? winnerA_token : winnerB_token
      localStorage.setItem(`tournament_finalist${phase - 4}`, winnerUserId)
      localStorage.setItem(`tournament_finalist${phase - 4}_token`, winnerToken)

      const loserUserId = winner === "left" ? winnerB : winnerA
      const loserLogin = localStorage.getItem(`tournament_login_${Array.from({length: 8}, (_, i) => i + 1).find(i => localStorage.getItem(`tournament_userId_${i}`) === loserUserId)!}`) || ""
      localStorage.setItem(`tournament_loser${phase - 4}`, loserLogin)
      if (phase === 5) {
        localStorage.setItem("tournament_phase", "6")
        showOnly("keyConfig")
        return
      }
      else {
        localStorage.setItem("tournament_phase", "7")
        showOnly("keyConfig")
        return
      }
    }
    // Finale
    if (phase === 7) {
      // Récupère tous les logins
      const logins: string[] = []
      const userIds: string[] = []
      for (let i = 1; i <= 8; i++) {
        logins[i] = localStorage.getItem(`tournament_login_${i}`) || ""
        userIds[i] = localStorage.getItem(`tournament_userId_${i}`) || ""
      }

      // Finalistes
      const finalist1 = localStorage.getItem("tournament_finalist1")!
      const finalist2 = localStorage.getItem("tournament_finalist2")!
      const finalist1Login = logins[userIds.findIndex(id => id === finalist1)]
      const finalist2Login = logins[userIds.findIndex(id => id === finalist2)]
      // Perdants des demis
      const loser1Login = localStorage.getItem("tournament_loser1")!
      const loser2Login = localStorage.getItem("tournament_loser2")!
      // Classement
      const losersQuarts: string[] = []
      for (let i = 1; i <= 4; i++) {
        const winnerId = localStorage.getItem(`tournament_winner${i}`)
        const idxA = (i - 1) * 2 + 1
        const idxB = idxA + 1
        const looserId = (winnerId === userIds[idxA] ? userIds[idxB] : userIds[idxA])
        const looserLogin = logins[userIds.findIndex(id => id === looserId)]
        losersQuarts.push(looserLogin)
      }
      const finalWinner = winner === "left" ? finalist1Login : finalist2Login
      const finalRunnerUp = winner === "left" ? finalist2Login : finalist1Login
      const finalScores: Score[] = [
        { player: finalWinner, score: 1 },
        { player: finalRunnerUp, score: 2 },
        { player: loser1Login, score: 3 },
        { player: loser2Login, score: 3 },
        { player: losersQuarts[0], score: 5 },
        { player: losersQuarts[1], score: 5 },
        { player: losersQuarts[2], score: 5 },
        { player: losersQuarts[3], score: 5 },
      ]
      const modalHtml = renderPanelFinalScoreTable(finalScores)
      document.body.insertAdjacentHTML("beforeend", modalHtml)
      const modal = document.getElementById("score-modal")
      const btn = document.getElementById("btn-next-result_rank")
      btn?.addEventListener("click", () => {
        modal?.remove()
        setTimeout(() => { showOnly("menu") })
      });
      [
        "tournament_userId_1", "tournament_token_1", "tournament_login_1",
        "tournament_userId_2", "tournament_token_2", "tournament_login_2",
        "tournament_userId_3", "tournament_token_3", "tournament_login_3",
        "tournament_userId_4", "tournament_token_4", "tournament_login_4",
        "tournament_userId_5", "tournament_token_5", "tournament_login_5",
        "tournament_userId_6", "tournament_token_6", "tournament_login_6",
        "tournament_userId_7", "tournament_token_7", "tournament_login_7",
        "tournament_userId_8", "tournament_token_8", "tournament_login_8",
        "tournament_winner1", "tournament_winner1_token", "tournament_winner2", "tournament_winner2_token",
        "tournament_winner3", "tournament_winner3_token", "tournament_winner4", "tournament_winner4_token",
        "tournament_finalist1","tournament_finalist1_token","tournament_finalist2","tournament_finalist2_token",
        "tournament_loser1","tournament_loser2","tournament_phase","tournament_original_token","tournament_original_userId"
      ].forEach(key=>localStorage.removeItem(key))
      return
    }
  }
}

export function getTournamentMatchPlayers(phase: number, playerCount: number) {
  if (playerCount === 4) {
    if (phase === 1) {
      return {
        token1: localStorage.getItem("tournament_token_1")!,
        userId1: localStorage.getItem("tournament_userId_1")!,
        login1: localStorage.getItem("tournament_login_1") || "",
        token2: localStorage.getItem("tournament_token_2")!,
        userId2: localStorage.getItem("tournament_userId_2")!,
        login2: localStorage.getItem("tournament_login_2") || "",
      }
    }
    if (phase === 2) {
      return {
        token1: localStorage.getItem("tournament_token_3")!,
        userId1: localStorage.getItem("tournament_userId_3")!,
        login1: localStorage.getItem("tournament_login_3") || "",
        token2: localStorage.getItem("tournament_token_4")!,
        userId2: localStorage.getItem("tournament_userId_4")!,
        login2: localStorage.getItem("tournament_login_4") || "",
      }
    }
    if (phase === 3) {
      return {
        token1: localStorage.getItem("tournament_winner1_token")!,
        userId1: localStorage.getItem("tournament_winner1")!,
        login1: localStorage.getItem("tournament_login_" + [1,2,3,4]
          .find(i => localStorage.getItem("tournament_userId_" +i) === localStorage.getItem("tournament_winner1"))!) || "",
        token2: localStorage.getItem("tournament_winner2_token")!,
        userId2: localStorage.getItem("tournament_winner2")!,
        login2: localStorage.getItem("tournament_login_" + [1,2,3,4]
          .find(i => localStorage.getItem("tournament_userId_" +i) === localStorage.getItem("tournament_winner2"))!) || "",
      }
    }
  }
  if (playerCount === 8) {
    if (phase >= 1 && phase <= 4) {
      const player_idA = (phase - 1) * 2 + 1
      const player_idB = player_idA + 1
      return {
        token1: localStorage.getItem(`tournament_token_${player_idA}`)!,
        userId1: localStorage.getItem(`tournament_userId_${player_idA}`)!,
        login1: localStorage.getItem(`tournament_login_${player_idA}`) || "",
        token2: localStorage.getItem(`tournament_token_${player_idB}`)!,
        userId2: localStorage.getItem(`tournament_userId_${player_idB}`)!,
        login2: localStorage.getItem(`tournament_login_${player_idB}`) || "",
      }
    }
    // Demis
    if (phase === 5 || phase === 6) {
      const player_idA = (phase - 4) * 2 - 1
      const player_idB = player_idA + 1
      const winnerA = localStorage.getItem(`tournament_winner${player_idA}`)!
      const winnerB = localStorage.getItem(`tournament_winner${player_idB}`)!
      const winnerA_token = localStorage.getItem(`tournament_winner${player_idA}_token`)!
      const winnerB_token = localStorage.getItem(`tournament_winner${player_idB}_token`)!
      const loginA = localStorage.getItem(`tournament_login_${[1,2,3,4,5,6,7,8]
        .find(i => localStorage.getItem(`tournament_userId_${i}`) === winnerA)}`) || ""
      const loginB = localStorage.getItem(`tournament_login_${[1,2,3,4,5,6,7,8]
        .find(i => localStorage.getItem(`tournament_userId_${i}`) === winnerB)}`) || ""
      return {
        token1: winnerA_token,
        userId1: winnerA,
        login1: loginA,
        token2: winnerB_token,
        userId2: winnerB,
        login2: loginB,
      }
    }
    // Finale
    if (phase === 7) {
      const finalist1 = localStorage.getItem("tournament_finalist1")!
      const finalist2 = localStorage.getItem("tournament_finalist2")!
      const finalist1_token = localStorage.getItem("tournament_finalist1_token")!
      const finalist2_token = localStorage.getItem("tournament_finalist2_token")!
      const login1 = localStorage.getItem(`tournament_login_${[1,2,3,4,5,6,7,8]
        .find(i => localStorage.getItem(`tournament_userId_${i}`) === finalist1)}`) || ""
      const login2 = localStorage.getItem(`tournament_login_${[1,2,3,4,5,6,7,8]
        .find(i => localStorage.getItem(`tournament_userId_${i}`) === finalist2)}`) || ""
      return {
        token1: finalist1_token,
        userId1: finalist1,
        login1,
        token2: finalist2_token,
        userId2: finalist2,
        login2,
      }
    }
  }
  return null
}