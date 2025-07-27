import { navigateTo, escapeHTML } from "../main";
import { attachLinkHandlers } from "../main";
import { t } from "../i18n";


export function dashboardFriendsView(): string {
  return `
    <div class="card-friends">
      <p class="text-cyan-200 mb-6">${t("friends.searchFriends")}</p>
      <form id="friends-search-form" autocomplete="off">
        <input id="nav-friends" type="text" placeholder="${t("friends.navFriends")}" class="input-main mb-4 w-full" required>
        <button type="submit" style="display:none"></button>
      </form>
      <div id="nav-friends-message" class="text-red-400"></div>
      <div id="friends-list"></div>
    </div>
  `;
}

export function attachDashboardFriendsEvents() {
  const token = localStorage.getItem("token");
  if (!token) {
    navigateTo("/login");
    return;
  }

  fetch("/api/friends/me/friends", {
    headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const friendsList = document.getElementById("friends-list");
      if (!friendsList) return;
      if (!Array.isArray(data) || data.length === 0) {
        friendsList.innerHTML = `<div class="text-cyan-100">${t("dashboard.no_friends")}</div>`;
        return;
      }
      friendsList.innerHTML = `
        <h2 class="text-3xl font-extrabold text-cyan-300 tracking-widest uppercase mb-8">${t("friends.friends")}</h2>
        <ul class="space-y-4">
          ${data.map((friend: any) => `
            <li class="flex items-center gap-4">
              <span class="avatar-circle">
                ${friend.avatar
                  ? `<img src="${friend.avatar}" alt="avatar" class="w-full h-full object-cover" />`
                  : `<span class="flex items-center justify-center h-full text-cyan-300 font-bold text-xl">${friend.login[0]?.toUpperCase() || "?"}</span>`
                }
              </span>
              <span class="text-cyan-200 font-semibold">${escapeHTML(friend.alias || friend.login)}</span>
              <a href="/profile/${friend.id}" class="ml-auto btn-small">
                ${t("dashboard.view_profile")}
              </a>
            </li>
          `).join("")}
        </ul>
      `;
      attachLinkHandlers();
    });

  const form = document.getElementById("friends-search-form") as HTMLFormElement | null;
  const msg = document.getElementById("nav-friends-message");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const friendsInput = document.getElementById("nav-friends") as HTMLInputElement | null;
      if (!friendsInput) return;
      const search = friendsInput.value.trim();
      if (!search) {
        if (msg) msg.textContent = t("friends.empty_search");
        return;
      }
      fetch("/api/users", {
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(users => {
          const found = users.find((u: any) =>
            search === u.alias || search === u.login
          );
          if (found) {
            navigateTo(`/profile/${found.id}`);
          } else if (msg) {
            msg.textContent = t("friends.not_found") + " " + search;
          }
        })
        .catch(() => {
          if (msg) msg.textContent = t("friends.network_error");
        });
    });
  }
}