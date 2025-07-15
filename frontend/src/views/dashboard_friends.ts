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
      <div class="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
        <h2 class="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">${t("dashboard.friends")}</h2>
        <div class="text-cyan-100">${t("dashboard.loading_friends")}</div>
      </div>
    `;
  }

  return `
    <div class="max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
      <h2 class="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">${t("dashboard.friends")}</h2>
      ${
        friendsCache.length === 0
          ? `<div class="text-cyan-100">${t("dashboard.no_friends")}</div>`
          : `<ul class="space-y-4">
              ${friendsCache
                .map(
                  (friend) => `
                  <li class="flex items-center gap-4">
                    <span class="inline-block w-10 h-10 rounded-full bg-cyan-900 border-2 border-cyan-400 overflow-hidden">
                      ${
                        friend.avatar
                          ? `<img src="${friend.avatar}" alt="avatar" class="w-full h-full object-cover" />`
                          : `<span class="flex items-center justify-center h-full text-cyan-300 font-bold text-xl">${friend.login[0]?.toUpperCase() || "?"}</span>`
                      }
                    </span>
                    <span class="text-cyan-200 font-semibold">${escapeHTML(friend.alias || friend.login)}</span>
                    <a href="/profile/${friend.id}" class="ml-auto bg-cyan-600 hover:bg-cyan-400 text-white px-4 py-1 rounded-lg shadow transition">
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
    updateFriendsView();

    fetch("/api/friends/me/friends", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        friendsCache = Array.isArray(data) ? data : [];
        friendsLoading = false;
        updateFriendsView();
      })
      .catch(() => {
        friendsCache = [];
        friendsLoading = false;
        updateFriendsView();
      });
  };

  if (!userId) {
    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          userId = String(data.id);
          localStorage.setItem("userId", userId);
          fetchFriends(userId);
        } else {
          friendsCache = [];
          friendsLoading = false;
          updateFriendsView();
        }
      })
      .catch(() => {
        friendsCache = [];
        friendsLoading = false;
        updateFriendsView();
      });
  } else {
    fetchFriends(userId);
  }
}

function updateFriendsView() {
  const content = document.getElementById("dashboard-content");
  if (content) {
    content.innerHTML = dashboardFriendsView();
    attachLinkHandlers();
  }
}