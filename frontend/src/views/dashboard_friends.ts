import { navigateTo, escapeHTML } from "../main";
import { attachLinkHandlers } from "../main";
import { t } from "../i18n";

type User = {
  id: number;
  login: string;
  email: string;
  alias?: string;
  avatar?: string;
};

let friendsCache: User[] = [];
let friendsLoading = false;

export function dashboardFriendsView(): string {
  if (friendsLoading) {
    return `
      <div class="card-friends">
        <h2 class="title-dashboard">${t("dashboard.friends")}</h2>
        <div class="text-cyan-100">${t("dashboard.loading_friends")}</div>
      </div>
    `;
  }

  return `
    <div class="card-friends">
      <p class="text-cyan-200 mb-6">${t("friends.searchFriends")}</p>
      <form id="friends-search-form" autocomplete="off">
        <input id="nav-friends" type="text" placeholder="${t("friends.navFriends")}" class="input-main mb-4 w-full" required>
        <button type="submit" style="display:none"></button>
      </form>
      <div id="nav-friends-message" class="text-red-400"></div>
      <h2 class="text-3xl font-extrabold text-cyan-300  tracking-widest uppercase mb-8">${t("friends.friends")}</h2>
      ${
        friendsCache.length === 0
          ? `<div class="text-cyan-100">${t("dashboard.no_friends")}</div>`
          : `<ul class="space-y-4">
              ${friendsCache
                .map(
                  (friend) => `
                  <li class="flex items-center gap-4">
                    <span class="avatar-circle">
                      ${
                        friend.avatar
                          ? `<img src="${friend.avatar}" alt="avatar" class="w-full h-full object-cover" />`
                          : `<span class="flex items-center justify-center h-full text-cyan-300 font-bold text-xl">${friend.login[0]?.toUpperCase() || "?"}</span>`
                      }
                    </span>
                    <span class="text-cyan-200 font-semibold">${escapeHTML(friend.alias || friend.login)}</span>
                    <a href="/profile/${friend.id}" class="ml-auto btn-small">
                      ${t("dashboard.view_profile")}
                    </a>
                  </li>
                `
                )
                .join("")}
            </ul>`
      }
    </div>
  `;
}

export function attachDashboardFriendsEvents() {
  const token = localStorage.getItem("token");
  if (!token) {
    navigateTo("/login");
    return;
  }

  // Récupère l'id utilisateur si absent du localStorage
  let userId = localStorage.getItem("userId");
  const fetchFriends = (id: string) => {
    friendsLoading = true;
    //updateFriendsView();

    fetch("/api/friends/me/friends", {
      headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        friendsCache = Array.isArray(data) ? data : [];
        friendsLoading = false;
        //updateFriendsView();
      })
      .catch(() => {
        friendsCache = [];
        friendsLoading = false;
        //updateFriendsView();
      });
  };

  if (!userId) {
    fetch("/api/users/me", { headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          userId = String(data.id);
          localStorage.setItem("userId", userId);
          fetchFriends(userId);
        } else {
          friendsCache = [];
          friendsLoading = false;
          //updateFriendsView();
        }
      })
      .catch(() => {
        friendsCache = [];
        friendsLoading = false;
        //updateFriendsView();
      });
  } else {
    fetchFriends(userId);
  }
  const navFriends = document.getElementById("nav-friends");
  if (navFriends)
  {
    const form = document.getElementById("friends-search-form") as HTMLFormElement | null;
    const msg = document.getElementById("nav-friends-message");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const friends = document.getElementById("nav-friends") as HTMLInputElement | null;
      if (!friends) return;
      const search = friends.value.trim();
      fetch("/api/users", {
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            if (msg) msg.textContent = t("friends.network_error");
            return;
          }
          if (!search) {
            if (msg) msg.textContent = t("friends.empty_search");
            return;
          }
          return res.json();
        })
        .then(users => {
          const userMap: Record<number, {  id?: number; alias?: string; login: string }> = {};
          users.forEach((u: any) => {
            userMap[u.id] = { id: u.id, alias: u.alias, login: u.login };
          });
          let found = false;
          for (const id in userMap) {
            const user = userMap[id];
            if (search == user.alias || search == user.login)
            {
              found = true;
              navigateTo(`/profile/${user.id}`);
            }
          }
          if (!found)
            msg!.textContent = t("friends.not_found") + " " + search;
        })
        .catch((err) => {
          if (!msg) return;
          if (err === "Unauthorized") return;
          msg.textContent = t("friends.network_error");
        });
    });
  }
}
/*
function updateFriendsView() {
  const content = document.getElementById("dashboard-content");
  if (content) {
    content.innerHTML = dashboardFriendsView();
    attachLinkHandlers();
  }
}*/