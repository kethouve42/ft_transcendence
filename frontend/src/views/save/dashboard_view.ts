import { t } from "../i18n";

export function dashboardView(): string {
    return `
    <div class="dashboard-bg">
        <div class="w-full flex flex-col items-center mb-10">
            <h2>Profil Utilisateur</h2><bMes informations...</b
            <div id="infoUser" class="w-full max-w-[1800px] card-main px-10 py-6 flex flex-col items-center"" id="profile-info"></div>
        </div>
        <div class="w-full max-w-[1800px] mx-auto flex flex-row gap-10">
            <div class="card-section max-h-[600px] overflow-y-auto">
                <h2>match Utilisateur pong</h2><bMes informations...</b
                <div id="matchUserpong" class="space-y-3"></div>
            </div>
            <div class="card-section max-h-[600px] overflow-y-auto">
                <h2>match Utilisateur clicker</h2><bMes informations...</b
                <div id="matchUserclicker" class="space-y-3"></div>
            </div>
        </div>
        <div class="w-full max-w-[1800px] mx-auto flex flex-row gap-10">
            <div class="card-section flex flex-col">
                <h2>stat Utilisateur pong</h2><bMes informations...</b
                <div id="statUserpong"></div>
            </div>
            <div class="card-section flex flex-col">
                <h2>stat Utilisateur clicker</h2><bMes informations...</b
                <div id="statUserclicker"></div>
            </div>
        </div>
        <div id="msg"></div>
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
                throw new Error(error.message);
            } else if (!matchReponsepong.ok) {
                const error = await matchReponsepong.json();
                throw new Error(error.message);
            } else if (!matchReponseclicker.ok) {
                const error = await matchReponseclicker.json();
                throw new Error(error.message);
            } else if (!statsReponsepong.ok) {
                const error = await statsReponsepong.json();
                throw new Error(error.message);
            } else if (!statsReponseclicker.ok) {
                const error = await statsReponseclicker.json();
                throw new Error(error.message);
            } else if (!usersReponse.ok) {
                const error = await usersReponse.json();
                throw new Error(error.message);
            }
            user = await userReponse.json();
            matchpong = await matchReponsepong.json();
            matchclicker = await matchReponseclicker.json();
            statspong = await statsReponsepong.json();
            statsclicker = await statsReponseclicker.json();
            users = await usersReponse.json();
        } catch (err: any) {
            msg!.textContent = (err);
        }

        const infoUser = document.getElementById("infoUser")
        if (infoUser)
        {

            infoUser.innerHTML = `<b${user.login}</b`;
        }
        const matchUserpong = document.getElementById("matchUserpong")
        if (matchUserpong)
        {
            if (matchpong.length < 0)
            {
                matchUserpong.innerHTML = `
                    <b${t("dashboard.no_pong_match")}}</b
                `;
            }
            else
            {
                for (let i = 0; i < matchpong.length; i++)
                {
                    matchUserpong.innerHTML += `
                        <b>Dernière partie: ${matchpong[i]?.date}</b
                        <b>${matchpong[i]?.date}</b
                        <b${t("dashboard.timerMatches")}: ${matchpong[i]?.target}</b
                        <b${t("dashboard.players")} 1: ${matchpong[i]?.user1_id}</b
                        <b${t("dashboard.score")}: ${matchpong[i]?.user1_score}</b
                        <b${t("dashboard.players")} 2: ${matchpong[i]?.user2_id}</b
                        <b${t("dashboard.score")}: ${matchpong[i]?.user2_score}</b
                        <b${t("dashboard.winner")}: ${matchpong[i]?.winner_id}</b
                        </br>
                    `;
                }
            }
        }

        const matchUserclicker = document.getElementById("matchUserclicker")
        if (matchUserclicker)
        {
            if (matchclicker.length < 0)
            {
                matchUserclicker.innerHTML = `
                    <b${t("dashboard.no_pong_match")}}</b
                `;
            }
            else
            {
                for (let i = 0; i < matchclicker.length; i++)
                {
                    matchUserclicker.innerHTML += `
                        <b>Dernière partie: ${matchclicker[i]?.date}</b
                        <b>${t("dashboard.game_mode")}: ${matchclicker[i]?.game_mode} ${t("dashboard.timerMatches")}: ${matchclicker[i]?.target}</b
                        <b>${t("dashboard.players")} 1: ${matchclicker[i]?.user1_id} ${t("dashboard.score")}: ${matchclicker[i]?.user1_score}</b
                        <b>${t("dashboard.players")} 2: ${matchclicker[i]?.user2_id} ${t("dashboard.score")}: ${matchclicker[i]?.user2_score}</b
                        <b>${t("dashboard.winner")}: ${matchclicker[i]?.winner_id}</b
                        </br>
                    `;
                }
            }
        }

        const statUserpong = document.getElementById("statUserpong")
        if (statUserpong)
        {
            statUserpong.innerHTML = `
                <bVictoires: ${statspong.global.wins}</b
                <bDéfaites: ${statspong.global.losses}</b
                <bRatio: ${statspong.global.winRate}%</b
            `;
        }

        const statUserclicker = document.getElementById("statUserclicker")
        if (statUserclicker)
        {
            statUserclicker.innerHTML = `
                <bTotal: ${statsclicker.totalMatches}</b
                <bVictoires: ${statsclicker.wins}</b
                <bRatio: ${statsclicker.winRate}%</b
            `;
        }
    }
    loadData();
}