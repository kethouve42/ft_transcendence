import { t } from "../../i18n"
import { showOnly } from "./game";

export function loginTournamentView(): string {
  const playerParam = new URLSearchParams(window.location.search).get("player");
  if (!playerParam) {
    throw new Error("Numéro de joueur de tournoi manquant dans l'URL");
  }
  const playerNum = Number(playerParam);
    return `
    <div class="settings-panel">
      <h2> ${t("tournament.login_page.title")} ${playerNum} </h2>
        <form id="tournament-login-form" class="flex flex-col gap-4">
        <input type="text" name="login" placeholder="${t("login.username")}" required class="input" />
          <input type="password" name="password" placeholder="${t("login.password")}" required class="input" />
          <button type="submit" class="menu-btn save-btn">${t("login.submit")}</button>
          <div id="tournament-login-message" class="text-cyan-200"></div>
          </form>
    </div>
    `
}
  
export function attachLoginTournamentEvents() {
  const form = document.getElementById("tournament-login-form") as HTMLFormElement | null
  const msg = document.getElementById("tournament-login-message")
  const playerParam = new URLSearchParams(window.location.search).get("player");
  if (!playerParam) {
    throw new Error("Numéro de joueur de tournoi manquant dans l'URL");
  }
  const playerNum = Number(playerParam);
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
      if (msg) msg.textContent = "Connecté !"
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