export function dashboardView(): string {
  return `
    <div class="w-full min-h-screen px-8 md:px-32 bg-gradient-to-br from-[#232526] via-[#0f2027] to-[#2c5364] py-10">
      <div class="w-full flex flex-col items-center mb-10">
        <div class="w-full max-w-[1800px] bg-cyan-900/40 rounded-2xl shadow-xl border border-cyan-400/30 px-10 py-6 flex flex-col items-center" id="profile-info"></div>
      </div>
      <div class="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row gap-10">
        <div class="flex-1 bg-cyan-900/30 rounded-2xl shadow-lg border border-cyan-400/20 p-4 max-h-[600px] overflow-y-auto">
          <h3 class="text-xl font-bold text-cyan-200 mb-4 text-center">10 derniers matchs</h3>
          <ul id="match-list" class="space-y-3"></ul>
        </div>
        <div class="flex-1 bg-cyan-900/30 rounded-2xl shadow-lg border border-cyan-400/20 p-4 flex flex-col">
          <h3 class="text-xl font-bold text-cyan-200 mb-4 text-center">Statistiques globales</h3>
          <div id="stats"></div>
        </div>
      </div>
      <a href="/" class="text-cyan-400 underline mt-8 inline-block">Retour accueil</a>
    </div>
  `;
}

export function attachDashboardViewEvents() {
  const token = localStorage.getItem("token");
  if (!token) {
    navigateTo("/login");
    return;
  }

  // 1. Récupère infos utilisateur
  fetch("/api/users/profil", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(user => {
      const info = document.getElementById("profile-info");
      if (info) {
        info.innerHTML = `
          <img src="${user.avatar || "http://localhost:3000/uploads/avatars/default-avatar.png"}" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg mb-4 object-cover" />
          <h2 class="text-3xl font-extrabold text-cyan-300 tracking-widest uppercase mb-2">${user.login}</h2>
          <div class="flex gap-6 text-cyan-100 text-lg">
            <span><b>Alias :</b> ${user.alias || '<span class="italic text-cyan-400">Aucun</span>'}</span>
            <span><b>Email :</b> ${user.email}</span>
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
            list.innerHTML = `<li class="text-cyan-400 text-center">Aucun match trouvé.</li>`;
            return;
          }
          list.innerHTML = matches.slice(0, 10).map((match: any) => `
            <li class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-cyan-300">${new Date(match.date).toLocaleDateString()}</span>
                <span class="text-xs text-cyan-400">${match.duration}s</span>
              </div>
              <div>
                <b>Joueurs :</b> ${renderUser(match.user1_id, userMap)} vs ${renderUser(match.user2_id, userMap)}
              </div>
              <div>
                <b>Score :</b> ${match.score}
              </div>
              <div>
                <b>Gagnant :</b> ${renderUser(match.winner_id, userMap)}
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
            if (statsDiv) statsDiv.innerHTML = `<p class="text-cyan-200 text-center">Chargement…</p>`;
            return;
          }
          statsDiv.innerHTML = `
            <div class="flex flex-col gap-6">
              <div class="bg-cyan-800/60 rounded-lg p-4 shadow">
                <h4 class="font-semibold text-cyan-300 mb-2">Global</h4>
                <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                  <div><b>Matchs :</b> ${userStats.global?.totalMatches ?? "?"}</div>
                  <div><b>Victoires :</b> ${userStats.global?.wins ?? "?"}</div>
                  <div><b>Défaites :</b> ${userStats.global?.losses ?? "?"}</div>
                  <div><b>Winrate :</b> ${userStats.global?.winRate ?? "?"}%</div>
                  <div><b>Durée moyenne :</b> ${userStats.global?.averageDuration ?? "?"} sec</div>
                  <div><b>Temps total :</b> ${userStats.global?.totalGameTime ? Math.round(userStats.global.totalGameTime / 60) : "?"} min</div>
                </div>
              </div>
              <div class="bg-cyan-800/60 rounded-lg p-4 shadow">
                <h4 class="font-semibold text-cyan-300 mb-2">Contre IA</h4>
                <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                  <div><b>Matchs :</b> ${userStats.vsAI?.matches ?? "?"}</div>
                  <div><b>Victoires :</b> ${userStats.vsAI?.wins ?? "?"}</div>
                  <div><b>Défaites :</b> ${userStats.vsAI?.losses ?? "?"}</div>
                  <div><b>Winrate :</b> ${userStats.vsAI?.winRate ?? "?"}%</div>
                  <div class="col-span-2"><b>Temps contre IA :</b> ${userStats.vsAI?.totalIaTime ? Math.round(userStats.vsAI.totalIaTime / 60) : "?"} min</div>
                </div>
              </div>
              <div class="bg-cyan-800/60 rounded-lg p-4 shadow">
                <h4 class="font-semibold text-cyan-300 mb-2">Contre Joueurs</h4>
                <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                  <div><b>Matchs :</b> ${userStats.vsPlayer?.matches ?? "?"}</div>
                  <div><b>Victoires :</b> ${userStats.vsPlayer?.wins ?? "?"}</div>
                  <div><b>Défaites :</b> ${userStats.vsPlayer?.losses ?? "?"}</div>
                  <div><b>Winrate :</b> ${userStats.vsPlayer?.winRate ?? "?"}%</div>
                  <div class="col-span-2"><b>Temps multi :</b> ${userStats.vsPlayer?.totalMultiTime ? Math.round(userStats.vsPlayer.totalMultiTime / 60) : "?"} min</div>
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
        info.innerHTML = `<div class="text-red-400">Erreur lors du chargement du profil : ${err.message || err}</div>`;
      }
      const list = document.getElementById("match-list");
      if (list) {
        list.innerHTML = `<li class="text-red-400 text-center">Erreur lors du chargement des matchs.</li>`;
      }
      const statsDiv = document.getElementById("stats");
      if (statsDiv) {
        statsDiv.innerHTML = `<div class="text-red-400 text-center">Erreur lors du chargement des stats.</div>`;
      }
    });
}

// Utilitaire pour afficher un utilisateur (alias ou login, ou IA)
function renderUser(id: number | null, userMap: Record<number, { alias?: string; login: string }>): string {
  if (!id) return `<span class="italic text-cyan-400">IA</span>`;
  const user = userMap[id];
  if (!user) return `<span>${id}</span>`;
  return `<span class="text-cyan-300 hover:underline cursor-pointer" onclick="navigateTo('/profile/${id}')">${user.alias || user.login}</span>`;
}

function navigateTo(route: string) {
  window.history.pushState({}, "", route);
  window.dispatchEvent(new PopStateEvent("popstate"));
}