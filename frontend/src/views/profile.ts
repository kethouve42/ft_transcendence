import { t } from "../i18n";
import { escapeHTML } from "../main"

export function profileView(userId: string | number): string {
  return `
    <div class="w-full min-h-screen px-8 md:px-32">
      <div class="card-profile">
        <div id="profile-content">${t("profile.loading")}</div>
        <div id="profile-action-msg" class="mt-4 text-cyan-200"></div>
      </div>
    </div>
  `;
}

export function attachProfileEvents(userId: string | number) {
  const content = document.getElementById("profile-content");
  const actionMsg = document.getElementById("profile-action-msg");
  const currentUserId = localStorage.getItem("userId");

  if (!content) return;
  console.log(`Loading profile for user ID: ${userId}`);
  fetch(`/api/users/${userId}`, {
      headers: { "Accept-Language": localStorage.getItem("lang") || "fr"}
  })
    .then(res => res.json())
    .then(user => {
      if (!user || user.error) {
        content.innerHTML = `<div>${t("profile.not_found")}</div>`;
        return;
      }

      const isOnline = user.last_seen && (Date.now() - Number(user.last_seen) < 60_000);

      content.innerHTML = `
        <div class="flex items-center gap-6 mb-8">
          <span class="avatar-profile relative">
            <img src="${user.avatar || "/uploads/default-avatar.png"}" alt="avatar" class="avatar-medium" />
            ${isOnline ? `
              <span class="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-white shadow" title="${t("profile.online")}">●</span>
            ` : ""}
          </span>
          <div>
            <div class="text-2xl font-bold text-cyan-200">${escapeHTML(user.alias || user.login)}</div>
            ${isOnline ? `<div class="text-green-400 text-sm font-semibold mt-1">${t("profile.online")}</div>` : ""}
          </div>
        </div>
        <div id="profile-actions"></div>
      `;

      if (String(user.id) !== String(currentUserId)) {
        checkFriendStatus(user.id, currentUserId, content, actionMsg);
      }
    });
}

function checkFriendStatus(profileId: number, currentUserId: string | null, content: HTMLElement, actionMsg: HTMLElement | null) {
  if (!currentUserId) return;
  fetch('/api/friends/me/friends', {
    headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.json())
    .then(data => {
      const isFriend = Array.isArray(data) && data.some((u: any) => String(u.id) === String(profileId));
      const actionsDiv = content.querySelector("#profile-actions");
      if (!actionsDiv) return;
      if (isFriend) {
        actionsDiv.innerHTML = `
          <button id="remove-friend-btn" class="btn-danger px-4 py-2">
            ${t("profile.remove_friend")}
          </button>
        `;
        const btn = document.getElementById("remove-friend-btn");
        if (btn) {
          btn.addEventListener("click", async () => {
            actionMsg!.textContent = "";
            const res = await fetch(`/api/friends/`, {
              method: "DELETE",
              headers: {
                "Accept-Language": localStorage.getItem("lang") || "fr",
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ friend_id: profileId }),
            });
            if (res.ok) {
              actionsDiv.innerHTML = `
                <button id="add-friend-btn" class="btn-main px-4 py-2">
                  ${t("profile.add_friend")}
                </button>
              `;
              actionMsg!.textContent = t("profile.friend_removed");
              attachAddFriendBtn(profileId, currentUserId, actionsDiv, actionMsg);
            } else {
              actionMsg!.textContent = t("profile.error_remove");
            }
          });
        }
      } else {
        actionsDiv.innerHTML = `
          <button id="add-friend-btn" class="btn-main px-4 py-2">
            ${t("profile.add_friend")}
          </button>
        `;
        attachAddFriendBtn(profileId, currentUserId, actionsDiv, actionMsg);
      }
    });
}

function attachAddFriendBtn(profileId: number, currentUserId: string, actionsDiv: Element, actionMsg: HTMLElement | null) {
  const btn = document.getElementById("add-friend-btn");
  if (btn) {
    btn.addEventListener("click", async () => {
      actionMsg!.textContent = "";
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ friend_id: profileId }),
      });
      if (res.ok) {
        actionsDiv.innerHTML = `
          <button id="remove-friend-btn" class="btn-danger px-4 py-2">
            ${t("profile.remove_friend")}
          </button>
        `;
        actionMsg!.textContent = t("profile.friend_added");
        const removeBtn = document.getElementById("remove-friend-btn");
        if (removeBtn) {
          removeBtn.addEventListener("click", async () => {
            actionMsg!.textContent = "";
            const res = await fetch("/api/friends/", {
              method: "DELETE",
              headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
              body: JSON.stringify({ friend_id: profileId }),
            });
            if (res.ok) {
              actionsDiv.innerHTML = `
                <button id="add-friend-btn" class="btn-main px-4 py-2">
                  ${t("profile.add_friend")}
                </button>
              `;
              actionMsg!.textContent = t("profile.friend_removed");
              attachAddFriendBtn(profileId, currentUserId, actionsDiv, actionMsg);
            } else {
              actionMsg!.textContent = t("profile.error_remove");
            }
          });
        }
      } else {
        actionMsg!.textContent = t("profile.error_add");
      }
    });
  }
}