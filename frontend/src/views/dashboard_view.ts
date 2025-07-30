import { t } from "../i18n";
import { navigateTo, escapeHTML } from "../main";

export function dashboardView(): string {
  return `
    <div class="dashboard-bg">
      <div class="w-full flex flex-col items-center mb-10">
        <div class="w-full max-w-[1800px] card-main px-10 py-6 flex flex-col items-center"" id="profile-info"></div>
      </div>
      <div class="w-full max-w-[1800px] mx-auto flex flex-row gap-10">
        <div class="card-section max-h-[600px] overflow-y-auto">

          <h3 class="h3-dashboard">${t("dashboard.last_matches")}</h3>
          <ul id="match-list" class="space-y-3"></ul>
          
        </div>
        <div class="card-section flex flex-col">

          <h3 class="h3-dashboard">${t("dashboard.pong_stats")}</h3>
          <div id="stats"></div>

        </div>
      </div>
      </br>
      <div class="w-full max-w-[1800px] mx-auto flex flex-row gap-10">
        <div class="card-section max-h-[600px] overflow-y-auto">
          <h3 class="h3-dashboard">${t("dashboard.last_matches_clicker")}</h3>
          <ul id="match-clicker-list" class="space-y-3"></ul>
        </div>
        <div class="card-section flex flex-col">
          <h3 class="h3-dashboard">${t("dashboard.clicker_stats")}</h3>
          <div id="stats-clicker"></div>
        </div>
      </div>

      <div class="gdpr-section">
        <h3 class="text-xl font-bold text-cyan-200 mb-4">${t("dashboard.gdpr_title") || "Vie privée & GDPR"}</h3>
        <div class="flex flex-row gap-4">
          <button id="gdpr-anonymize" class=" grpd-main">${t("dashboard.gdpr_anonymize") || "Anonymiser mes données"}</button>
          <button id="gdpr-export" class=" grpd-main">${t("dashboard.gdpr_export") || "Exporter mes données"}</button>
          <button id="gdpr-delete" class=" grpd-main">${t("dashboard.gdpr_delete") || "Supprimer mon compte"}</button>
          <a href="/privacy" class="text-cyan-400 underline self-center">${t("dashboard.gdpr_policy") || "Politique de confidentialité"}</a>
        </div>
        <div id="gdpr-message" class="mt-4 text-center"></div>
      </div>
      <a href="/" class="link-main mt-8 inline-block">${t("dashboard.back_home")}</a>
    </div>
  `;
}

export function attachDashboardViewEvents() {
  const token = localStorage.getItem("token");
  if (!token) {
    navigateTo("/login");
    return;
  }

  setTimeout(() => {
    const token = localStorage.getItem("token");
    const msg = document.getElementById("gdpr-message");

    const anonymBtn = document.getElementById("gdpr-anonymize");
    if (anonymBtn) {
      anonymBtn.addEventListener("click", () => {
        showPopup(t(t("dashboard.gdpr_confirm_anonymize")), async () => {
          const res = await fetch("/api/users/me/anonymize", {
            method: "POST",
            headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            localStorage.clear();
            msg!.textContent = t("dashboard.gdpr_anonymized");
            setTimeout(() => navigateTo("/"), 500);
          } else {
            msg!.textContent = t("dashboard.gdpr_error_anonymize");
          }
        });
      });
    }

    const exportBtn = document.getElementById("gdpr-export");
    if (exportBtn) {
      exportBtn.addEventListener("click", async () => {
        const res = await fetch("/api/users/me/export", {
          headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = t("dashboard.gdpr_export_filename");
          a.click();
          msg!.textContent = t("dashboard.gdpr_exported");
        } else {
          msg!.textContent = t("dashboard.gdpr_error_export");
        }
      });
    }

    const deleteBtn = document.getElementById("gdpr-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        showPopup(t("dashboard.gdpr_confirm_delete"), () => {
          showPopup(t("dashboard.gdpr_confirm_delete2"), () => {
            showPopup(t("dashboard.gdpr_confirm_delete3"), () => {
              showPopup(t("dashboard.gdpr_confirm_delete4"), async () => {
                const res = await fetch("/api/users/me", {
                  method: "DELETE",
                  headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                  localStorage.clear();
                  msg!.textContent = t("dashboard.gdpr_deleted");
                  setTimeout(() => navigateTo("/"), 500);
                } else {
                  msg!.textContent = t("dashboard.gdpr_error_delete");
                }
              });
            });
          });
        });
      });
    }
  }, 0);
  
  fetch("/api/users/profil", {
    headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(user => {
      const info = document.getElementById("profile-info");
      if (info) {
        info.innerHTML = `
          <img src="${user.avatar || "/uploads/default-avatar.png"}" alt="Avatar" class="avatar-profile" />
          <h2 class="text-3xl font-extrabold text-cyan-300 tracking-widest uppercase mb-2">${escapeHTML(user.login)}</h2>
          <div class="flex gap-6 text-cyan-100 text-lg">
            <span><b>${t("dashboard.alias")} :</b> ${escapeHTML(user.alias) || `<span class="italic text-cyan-400">${t("dashboard.none")}</span>`}</span>
            <span><b>${t("dashboard.email")} :</b> ${escapeHTML(user.email)}</span>
          </div>
        `;
      }

      return fetch("/api/users", {
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(users => {
          const userMap: Record<number, { alias?: string; login: string }> = {};
          users.forEach((u: any) => {
            userMap[u.id] = { alias: u.alias, login: u.login };
          });
          return { user, userMap };
        });
    })
    .then(({ user, userMap }) => {
      fetch(`/api/matchs/user/me`, {
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((matches: any[]) => {
          const list = document.getElementById("match-list");
          if (!list) return;
          if (!Array.isArray(matches) || matches.length === 0) {
            list.innerHTML = `<li class="text-cyan-400 text-center">${t("dashboard.no_pong_match")}</li>`;
            return;
          }
          list.innerHTML = matches.slice(0, 10).map((match: any) => `
            <li class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-cyan-300">${new Date(match.date).toLocaleDateString()}</span>
                <span class="text-xs text-cyan-400">${match.duration}s</span>
              </div>
              <div>
                <b>${t("dashboard.players")} :</b> ${renderUser(match.user1_id, userMap)} vs ${renderUser(match.user2_id, userMap)}
              </div>
              <div>
                <b>${t("dashboard.score")} :</b> ${match.score}
              </div>
              <div>
                <b>${t("dashboard.winner")} :</b> ${renderUser(match.winner_id, userMap)}
              </div>
            </li>
          `).join("");
        });

      fetch(`/api/matchs/user/me/stats`, {
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((userStats: any) => {
          const statsDiv = document.getElementById("stats");
          if (!statsDiv || !userStats) {
            if (statsDiv) statsDiv.innerHTML = `<p class="text-cyan-200 text-center">${t("dashboard.no_pong_stats")}</p>`;
            return;
          }
          statsDiv.innerHTML = `
            <div class="flex flex-col gap-6">
              <div class="bg-cyan-800/60 rounded-lg p-4 shadow">
                <h4 class="font-semibold text-cyan-300 mb-2">${t("dashboard.global")}</h4>
                <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                  <div><b>${t("dashboard.matches")} :</b> ${userStats.global?.totalMatches ?? "?"}</div>
                  <div><b>${t("dashboard.wins")} :</b> ${userStats.global?.wins ?? "?"}</div>
                  <div><b>${t("dashboard.losses")} :</b> ${userStats.global?.losses ?? "?"}</div>
                  <div><b>${t("dashboard.winrate")} :</b> ${userStats.global?.winRate ?? "?"}%</div>
                  <div><b>${t("dashboard.avg_duration")} :</b> ${userStats.global?.averageDuration ?? "?"} sec</div>
                  <div><b>${t("dashboard.total_time")} :</b> ${userStats.global?.totalGameTime ? Math.round(userStats.global.totalGameTime / 60) : "?"} min</div>
                </div>
              </div>
              <div class="bg-cyan-800/60 rounded-lg p-4 shadow">
                <h4 class="font-semibold text-cyan-300 mb-2">${t("dashboard.vs_ai")}</h4>
                <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                  <div><b>${t("dashboard.matches")} :</b> ${userStats.vsAI?.matches ?? "?"}</div>
                  <div><b>${t("dashboard.wins")} :</b> ${userStats.vsAI?.wins ?? "?"}</div>
                  <div><b>${t("dashboard.losses")} :</b> ${userStats.vsAI?.losses ?? "?"}</div>
                  <div><b>${t("dashboard.winrate")} :</b> ${userStats.vsAI?.winRate ?? "?"}%</div>
                  <div class="col-span-2"><b>${t("dashboard.time_vs_ai")} :</b> ${userStats.vsAI?.totalIaTime ? Math.round(userStats.vsAI.totalIaTime / 60) : "?"} min</div>
                </div>
              </div>
              <div class="bg-cyan-800/60 rounded-lg p-4 shadow">
                <h4 class="font-semibold text-cyan-300 mb-2">${t("dashboard.vs_players")}</h4>
                <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                  <div><b>${t("dashboard.matches")} :</b> ${userStats.vsPlayer?.matches ?? "?"}</div>
                  <div><b>${t("dashboard.wins")} :</b> ${userStats.vsPlayer?.wins ?? "?"}</div>
                  <div><b>${t("dashboard.losses")} :</b> ${userStats.vsPlayer?.losses ?? "?"}</div>
                  <div><b>${t("dashboard.winrate")} :</b> ${userStats.vsPlayer?.winRate ?? "?"}%</div>
                  <div class="col-span-2"><b>${t("dashboard.time_multi")} :</b> ${userStats.vsPlayer?.totalMultiTime ? Math.round(userStats.vsPlayer.totalMultiTime / 60) : "?"} min</div>
                </div>
              </div>
            </div>
          `;
        });
      fetch(`/api/clicker/user/me`, {
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((matches: any[]) => {
          const list = document.getElementById("match-clicker-list");
          if (!list) return;
          if (!Array.isArray(matches) || matches.length === 0) {
            list.innerHTML = `<li class="text-cyan-400 text-center">${t("dashboard.no_clicker_match")}</li>`;
            return;
          }
          list.innerHTML = matches.slice(0, 10).map((match: any) => {
            if (match.game_mode == "timer") 
              return`
                <li class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-cyan-300">${new Date(match.date).toLocaleDateString()}</span>
                    <span class="text-xs text-cyan-400">${match.target}s</span>
                  </div>
                  <div>
                  
                    <b>${t("dashboard.players")} :</b> ${renderUser(match.user1_id, userMap)} vs ${renderUser(match.user2_id, userMap)}
                  </div>
                  <div>
                    <b>${t("dashboard.score")} :</b> user 1: ${match.user1_score} vs user 2: ${match.user2_score}
                  </div>
                  <div>
                    <b>${t("dashboard.winner")} :</b> ${renderUser(match.winner_id, userMap)}
                  </div>
                  <div>
                    <b>${t("dashboard.game_mode")} :</b> ${match.game_mode}
                  </div>
                </li>
              `
            else
              return`
              <li class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                <div class="flex justify-between items-center mb-1">
                  <span class="font-bold text-cyan-300">${new Date(match.date).toLocaleDateString()}</span>
                </div>
                <div>
                
                  <b>${t("dashboard.players")} :</b> ${renderUser(match.user1_id, userMap)} vs ${renderUser(match.user2_id, userMap)}
                </div>
                <div>
                  <b>${t("dashboard.score")} :</b> user 1: ${match.user1_score} / ${match.target} vs user 2: ${match.user2_score} / ${match.target}
                </div>
                <div>
                  <b>${t("dashboard.winner")} :</b> ${renderUser(match.winner_id, userMap)}
                </div>
                <div>
                  <b>${t("dashboard.game_mode")} :</b> ${match.game_mode}
                </div>
              </li>
            `
          }
          ).join("");
        });
      fetch(`/api/clicker/user/me/stats`, {
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((userStats: any) => {
          const statsDiv = document.getElementById("stats-clicker");
          if (!statsDiv || !userStats) {
            if (statsDiv) statsDiv.innerHTML = `<p class="text-cyan-200 text-center">${t("dashboard.no_clicker_stats")}</p>`;
            return;
          }
          statsDiv.innerHTML = `
            <div class="flex flex-col gap-6">
              <div class="bg-cyan-800/60 rounded-lg p-4 shadow">
                <h4 class="font-semibold text-cyan-300 mb-2">${t("dashboard.global")}</h4>
                <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                  <div><b>${t("dashboard.matches")} :</b> ${userStats.totalMatches ?? "?"}</div>
                  <div><b>${t("dashboard.wins")} :</b> ${userStats.wins ?? "?"}</div>
                  <div><b>${t("dashboard.losses")} :</b> ${userStats.losses ?? "?"}</div>
                  <div><b>${t("dashboard.winrate")} :</b> ${userStats.winRate ?? "?"}%</div>
                  <div><b>${t("dashboard.timerMatches")} :</b> ${userStats.timerMatches ?? "?"}</div>
                  <div><b>${t("dashboard.chronoMatches")} :</b> ${userStats.chronoMatches ?? "?"}</div>
                </div>
              </div>
            </div>
          `;
        });
    })
    .catch((err) => {
      const info = document.getElementById("profile-info");
      if (info) {
        info.innerHTML = `<div class="text-red-400">${t("dashboard.error_profile")} : ${err.message || err}</div>`;
      }
      const list = document.getElementById("match-list");
      if (list) {
        list.innerHTML = `<li class="text-red-400 text-center">${t("dashboard.error_matches")}</li>`;
      }
      const statsDiv = document.getElementById("stats");
      if (statsDiv) {
        statsDiv.innerHTML = `<div class="text-red-400 text-center">${t("dashboard.error_stats")}</div>`;
      }
    });
}

function renderUser(id: number | null, userMap: Record<number, { alias?: string; login: string }>): string {
  if (!id) return `<span class="italic text-cyan-400">${t("dashboard.ia")}</span>`;
  const user = userMap[id];
  if (!user) return `<span>${id}</span>`;
  return `<span class="text-cyan-300 hover:underline cursor-pointer" onclick="navigateTo('/profile/${id}')">${escapeHTML(user.alias || user.login)}</span>`;
}

function showPopup(message: string, onConfirm: () => void) {

  const modal = document.createElement("div");
  modal.id = "confirm-modal";
  modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]";
  modal.innerHTML = `
    <div class="bg-cyan-900 rounded-2xl shadow-2xl border-2 border-cyan-400 p-8 flex flex-col items-center max-w-md w-full" role="dialog" aria-modal="true">
      <p class="text-cyan-200 mb-6">${message}</p>
      <div class="flex gap-4">
        <button id="confirm-yes" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold">${t("all.yes")}</button>
        <button id="confirm-no" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold">${t("all.no")}</button>
      </div>
    </div>
  `;
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);

    document.getElementById("confirm-yes")?.addEventListener("click", () => {
      modal.remove();
      onConfirm();
    });
    document.getElementById("confirm-no")?.addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirm-yes")?.focus();
}