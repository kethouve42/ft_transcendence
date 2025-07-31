import { t } from "../i18n";
import { escapeHTML, navigateTo} from "../main"

export function dashboardView(): string {
    return `
    <div class="dashboard-bg">
        <div class="w-full flex flex-col items-center mb-10">
            <div id="infoUser" class="w-full max-w-[1800px] card-main px-10 py-6 flex flex-col items-center""></div>
        </div>
        <div class="w-full max-w-[1800px] mx-auto flex flex-row gap-10 mb-10">
            <div class="card-section max-h-96 overflow-y-auto">
                <h2>${t("dashboard.last_matches")}</h2>
                <div id="matchUserpong" class="space-y-3"></div>
            </div>
            <div class="card-section max-h-96 overflow-y-auto">
                <h2>${t("dashboard.last_matches_clicker")}</h2>
                <div id="matchUserclicker" class="space-y-3"></div>
            </div>
        </div>
        <div class="w-full max-w-[1800px] mx-auto flex flex-row gap-10 mb-10">
            <div class="card-section flex flex-col">
                <h2>${t("dashboard.pong_stats")}</h2>
                <div id="statUserpong"></div>
            </div>
            <div class="card-section flex flex-col">
                <h2>${t("dashboard.clicker_stats")}</h2>
                <div id="statUserclicker"></div>
            </div>
        </div>
        <div id="msg"></div>
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

export function attachDashboardViewEvents (): void {
    const msg = document.getElementById("msg")
    if (!msg) return
    const token = localStorage.getItem("token");
    if (!token) return
    async function loadData()
    {
        let user, matchpong, matchclicker, statspong, statsclicker, users;
        try {
            const [userReponse, matchReponsepong, matchReponseclicker, statsReponsepong, statsReponseclicker, usersReponse] = await Promise.all([
                fetch("/api/users/profil", {method: "GET",headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }}),
                fetch("/api/matchs/user/me", {method: "GET",headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }}),
                fetch("/api/clicker/user/me", {method: "GET",headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }}),
                fetch("/api/matchs/user/me/stats", {method: "GET",headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }}),
                fetch("/api/clicker/user/me/stats", {method: "GET",headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }}),
                fetch("/api/users/", {method: "GET",headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }}),
            ]);
            if (!userReponse.ok) {
                const error = await userReponse.json();
                throw new Error(error.error);
            } else if (!matchReponsepong.ok) {
                const error = await matchReponsepong.json();
                throw new Error(error.error);
            } else if (!matchReponseclicker.ok) {
                const error = await matchReponseclicker.json();
                throw new Error(error.error);
            } else if (!statsReponsepong.ok) {
                const error = await statsReponsepong.json();
                throw new Error(error.error);
            } else if (!statsReponseclicker.ok) {
                const error = await statsReponseclicker.json();
                throw new Error(error.error);
            } else if (!usersReponse.ok) {
                const error = await usersReponse.json();
                throw new Error(error.error);
            }
            user = await userReponse.json();
            matchpong = await matchReponsepong.json();
            matchclicker = await matchReponseclicker.json();
            statspong = await statsReponsepong.json();
            statsclicker = await statsReponseclicker.json();
            users = await usersReponse.json();
        } catch (err: any) {
            msg!.textContent = err.message;
        }

        const infoUser = document.getElementById("infoUser")
        if (infoUser)
        {
            infoUser.innerHTML = `
            <img src="${user.avatar || "/uploads/default-avatar.png"}" alt="Avatar" class="avatar-profile" />
            <h2 class="text-3xl font-extrabold text-cyan-300 tracking-widest uppercase mb-2">${escapeHTML(user.login)}</h2>
            <div class="flex gap-6 text-cyan-100 text-lg">
                <b>${t("dashboard.alias")} : ${escapeHTML(user.alias) || t("dashboard.none")}</b>
                <b>${t("dashboard.email")} : ${escapeHTML(user.email)}</b>
            </div>
            `;
        }
        const matchUserpong = document.getElementById("matchUserpong")
        if (matchUserpong)
        {
            if (matchpong.length === 0)
            {
                matchUserpong.innerHTML = `
                    <b>${t("dashboard.no_pong_match")}</b>
                `;
            }
            else
            {
                for (let i = 0; i < matchpong.length && i < 10; i++)
                {
                    matchUserpong.innerHTML += `
                        <div class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <b>${new Date(matchpong[i]?.date).toLocaleDateString()}</b>
                                    <b>${matchpong[i]?.duration} s</b>
                                </div>
                                <div>
                                    <b>${t("dashboard.players")} :</b> ${renderPlayer(matchpong[i]?.user1_id, users)} vs ${renderPlayer(matchpong[i]?.user2_id, users)}
                                </div>
                                <div>
                                    <b>${t("dashboard.score")}: ${matchpong[i]?.score}</b>
                                </div>
                                <div>
                                    <b>${t("dashboard.winner")}: ${renderPlayer(matchpong[i]?.winner_id, users)}</b>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        }

        const matchUserclicker = document.getElementById("matchUserclicker")
        if (matchUserclicker)
        {
            if (matchclicker.length === 0)
            {
                matchUserclicker.innerHTML = `
                    <b>${t("dashboard.no_clicker_match")}</b>
                `;
            }
            else
            {
                for (let i = 0; i < matchclicker.length && i < 10; i++)
                {
                    if (matchclicker[i]?.game_mode == "timer") 
                    matchUserclicker.innerHTML += `
                        <div class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                            <div class="flex justify-between items-center mb-1">
                                <b>${new Date(matchclicker[i]?.date).toLocaleDateString()}</b>
                                <b>${matchclicker[i]?.target} s</b>
                            </div>
                            <div>
                            
                                <b>${t("dashboard.players")} :</b> ${renderPlayer(matchclicker[i]?.user1_id, users)} vs ${renderPlayer(matchclicker[i]?.user2_id, users)}</b>
                            </div>
                            <div>
                                <b>${t("dashboard.score")} : ${t("dashboard.players")} 1: ${matchclicker[i]?.user1_score} vs ${t("dashboard.players")} 2: ${matchclicker[i]?.user2_score}</b>
                            </div>
                            <div>
                                <b>${t("dashboard.winner")} : ${renderPlayer(matchclicker[i]?.winner_id, users)}</b>
                            </div>
                            <div>
                                <b>${t("dashboard.game_mode")} : ${matchclicker[i]?.game_mode}</b>
                            </div>
                        </div>
                    `
                    else
                    matchUserclicker.innerHTML += `
                    <div class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                        <div class="flex justify-between items-center mb-1">
                            <b>${new Date(matchclicker[i]?.date).toLocaleDateString()}</b>
                        </div>
                        <div>
                            <b>${t("dashboard.players")} : ${renderPlayer(matchclicker[i]?.user1_id, users)} vs ${renderPlayer(matchclicker[i]?.user2_id, users)} </b>
                        </div>
                        <div>
                            <b>${t("dashboard.score")} : ${t("dashboard.players")} 1: ${matchclicker[i]?.user1_score} / ${matchclicker[i]?.target} vs ${t("dashboard.players")} 2: ${matchclicker[i]?.user2_score} / ${matchclicker[i]?.target} </b> 
                        </div>
                        <div>
                            <b>${t("dashboard.winner")} : ${renderPlayer(matchclicker[i]?.winner_id, users)}</b>
                        </div>
                        <div>
                            <b>${t("dashboard.game_mode")} : ${matchclicker[i]?.game_mode}</b>
                        </div>
                    </div>
                    `;
                }
            }
        }

        const statUserpong = document.getElementById("statUserpong")
        if (statUserpong)
        {
            statUserpong.innerHTML = `
            <div>
                <div class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                    <h4>${t("dashboard.global")}</h4>
                    <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                        <b>${t("dashboard.matches")} : ${statspong.global.totalMatches ?? "?"}</b>
                        <b>${t("dashboard.wins")} : ${statspong.global.wins ?? "?"}</b>
                        <b>${t("dashboard.losses")} : ${statspong.global.losses ?? "?"}</b>
                        <b>${t("dashboard.winrate")} : ${statspong.global.winRate ?? "?"}%</b>
                        <b>${t("dashboard.avg_duration")} : ${statspong.global.averageDuration ?? "?"}s</b>
                        <b>${t("dashboard.total_time")} : ${statspong.global.totalGameTime ?? "?"}s</b>
                    </div>
                </div>
                <div class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                    <h4>${t("dashboard.vs_ai")}</h4>
                    <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                        <b>${t("dashboard.matches")} : ${statspong.vsAI.matches ?? "?"}</b>
                        <b>${t("dashboard.wins")} : ${statspong.vsAI.wins ?? "?"}</b>
                        <b>${t("dashboard.losses")} : ${statspong.vsAI.losses ?? "?"}</b>
                        <b>${t("dashboard.winrate")} : ${statspong.vsAI.winRate ?? "?"}%</b>
                        <b>${t("dashboard.total_time")} : ${statspong.vsAI.totalIaTime ?? "?"}s</b>
                    </div>
                </div>
                <div class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                    <h4>${t("dashboard.vs_players")}</h4>
                    <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                        <b>${t("dashboard.matches")} : ${statspong.vsPlayer.matches ?? "?"}</b>
                        <b>${t("dashboard.wins")} : ${statspong.vsPlayer.wins ?? "?"}</b>
                        <b>${t("dashboard.losses")} : ${statspong.vsPlayer.losses ?? "?"}</b>
                        <b>${t("dashboard.winrate")} : ${statspong.vsPlayer.winRate ?? "?"}%</b>
                        <b>${t("dashboard.total_time")} : ${statspong.vsPlayer.totalMultiTime ?? "?"}s</b>
                    </div>
                </div>
            </div>
            `;
        }

        const statUserclicker = document.getElementById("statUserclicker")
        if (statUserclicker)
        {
            statUserclicker.innerHTML = `
            <div class="bg-cyan-800/60 border border-cyan-500/30 rounded-lg p-3 shadow-md text-cyan-100 text-sm hover:scale-[1.03] transition-transform">
                <div>
                    <h4>${t("dashboard.global")}</h4>
                    <div class="grid grid-cols-2 gap-2 text-cyan-100 text-sm">
                        <div>
                            <b>${t("dashboard.matches")} : ${statsclicker.totalMatches ?? "?"}</b>
                        </div>
                        <div>
                            <b>${t("dashboard.wins")} : ${statsclicker.wins ?? "?"}</b>
                        </div>
                        <div >
                            <b>${t("dashboard.winrate")} : ${statsclicker.winRate ?? "?"}</b>
                        </div>
                        <div>
                            <b>${t("dashboard.losses")} : ${statsclicker.losses ?? "?"}</b>
                        </div>
                        <div >
                            <b>${t("dashboard.timerMatches")} : ${statsclicker.timerMatches ?? "?"}</b>
                        </div >
                        <div>
                            <b>${t("dashboard.chronoMatches")} : ${statsclicker.chronoMatches ?? "?"}</b>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
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
    loadData();
}

function renderPlayer(userId: number | null, allUsers: any[]) {
    if (!userId) {
        return "IA";
    }
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        return `<span class="text-gray-400">${userId}</span>`;
    }
    return `<span onclick="navigateTo('/profile/${userId}')" class="text-cyan-300">${escapeHTML(user.login)}</span>`;
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