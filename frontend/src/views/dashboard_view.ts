import { t } from "../i18n";
import { navigateTo, escapeHTML } from "../main";

export function dashboardView(): string {
  return `
    <div class="w-full min-h-screen px-8 md:px-32 bg-gradient-to-br from-[#232526] via-[#0f2027] to-[#2c5364] py-10">
      <div class="w-full flex flex-col items-center mb-10">
        <div class="w-full max-w-[1800px] bg-cyan-900/40 rounded-2xl shadow-xl border border-cyan-400/30 px-10 py-6 flex flex-col items-center" id="profile-info"></div>
      </div>
      <div class="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row gap-10">
        <div class="flex-1 bg-cyan-900/30 rounded-2xl shadow-lg border border-cyan-400/20 p-4 max-h-[600px] overflow-y-auto">
          <h3 class="text-xl font-bold text-cyan-200 mb-4 text-center">${t("dashboard.last_matches")}</h3>
          <ul id="match-list" class="space-y-3"></ul>
        </div>
        <div class="flex-1 bg-cyan-900/30 rounded-2xl shadow-lg border border-cyan-400/20 p-4 flex flex-col">
          <h3 class="text-xl font-bold text-cyan-200 mb-4 text-center">${t("dashboard.global_stats")}</h3>
          <div id="stats"></div>
        </div>
      </div>
      <div class="w-full max-w-[1800px] mx-auto mt-10 bg-cyan-900/30 rounded-2xl shadow-lg border border-cyan-400/20 p-6">
        <h3 class="text-xl font-bold text-cyan-200 mb-4">${t("dashboard.gdpr_title") || "Vie privée & GDPR"}</h3>
        <div class="flex flex-col md:flex-row gap-4">
          <button id="gdpr-anonymize" class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition">${t("dashboard.gdpr_anonymize") || "Anonymiser mes données"}</button>
          <button id="gdpr-export" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">${t("dashboard.gdpr_export") || "Exporter mes données"}</button>
          <button id="gdpr-delete" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">${t("dashboard.gdpr_delete") || "Supprimer mon compte"}</button>
          <a href="/privacy" class="text-cyan-400 underline self-center">${t("dashboard.gdpr_policy") || "Politique de confidentialité"}</a>
        </div>
        <div id="gdpr-message" class="mt-4 text-center"></div>
      </div>
      <a href="/" class="text-cyan-400 underline mt-8 inline-block">${t("dashboard.back_home")}</a>
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
      anonymBtn.addEventListener("click", async () => {
        if (!confirm(t("dashboard.gdpr_confirm_anonymize"))) return;
        const res = await fetch("/api/users/me/anonymize", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          msg!.textContent = t("dashboard.gdpr_anonymized");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          msg!.textContent = t("dashboard.gdpr_error_anonymize");
        }
      });
    }

    const exportBtn = document.getElementById("gdpr-export");
    if (exportBtn) {
      exportBtn.addEventListener("click", async () => {
        const res = await fetch("/api/users/me/export", {
          headers: { Authorization: `Bearer ${token}` }
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
      deleteBtn.addEventListener("click", async () => {
        if (!confirm(t("dashboard.gdpr_confirm_delete"))) return;
        if (!confirm(t("dashboard.gdpr_confirm_delete2"))) return;
        if (!confirm(t("dashboard.gdpr_confirm_delete3"))) return;
        if (!confirm(t("dashboard.gdpr_confirm_delete4"))) return;
        const res = await fetch("/api/users/me", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          localStorage.clear();
          msg!.textContent = t("dashboard.gdpr_deleted");
          setTimeout(() => navigateTo("/"), 1500);
        } else {
          msg!.textContent = t("dashboard.gdpr_error_delete");
        }
      });
    }
  }, 0);
  
  fetch("/api/users/profil", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(user => {
      const info = document.getElementById("profile-info");
      if (info) {
        info.innerHTML = `
          <img src="${user.avatar || "/uploads/default-avatar.png"}" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg mb-4 object-cover" />
          <h2 class="text-3xl font-extrabold text-cyan-300 tracking-widest uppercase mb-2">${escapeHTML(user.login)}</h2>
          <div class="flex gap-6 text-cyan-100 text-lg">
            <span><b>${t("dashboard.alias")} :</b> ${escapeHTML(user.alias) || `<span class="italic text-cyan-400">${t("dashboard.none")}</span>`}</span>
            <span><b>${t("dashboard.email")} :</b> ${escapeHTML(user.email)}</span>
          </div>
        `;
      }

      // 2. Récupère tous les utilisateurs pour mapping id → alias/login
      return fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` }
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
      // 3. Récupère les matchs de l'utilisateur connecté
      fetch(`/api/matchs/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((matches: any[]) => {
          const list = document.getElementById("match-list");
          if (!list) return;
          if (!Array.isArray(matches) || matches.length === 0) {
            list.innerHTML = `<li class="text-cyan-400 text-center">${t("dashboard.no_match")}</li>`;
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

      // 4. Récupère les stats de l'utilisateur connecté
      fetch(`/api/matchs/user/me/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((userStats: any) => {
          const statsDiv = document.getElementById("stats");
          if (!statsDiv || !userStats) {
            if (statsDiv) statsDiv.innerHTML = `<p class="text-cyan-200 text-center">${t("dashboard.loading")}</p>`;
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
    })
    .catch((err) => {
      // Gestion d'erreur globale
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

// Utilitaire pour afficher un utilisateur (alias ou login, ou IA)
function renderUser(id: number | null, userMap: Record<number, { alias?: string; login: string }>): string {
  if (!id) return `<span class="italic text-cyan-400">${t("dashboard.ia")}</span>`;
  const user = userMap[id];
  if (!user) return `<span>${id}</span>`;
  return `<span class="text-cyan-300 hover:underline cursor-pointer" onclick="navigateTo('/profile/${id}')">${escapeHTML(user.alias || user.login)}</span>`;
}