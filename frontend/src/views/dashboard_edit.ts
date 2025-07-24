import { navigateTo, escapeHTML } from "../main";
import { t } from "../i18n";

export function dashboardEditView(): string {
  return `
    <div class="w-full min-h-screen px-8 md:px-32 bg-gradient-to-br from-[#232526] via-[#0f2027] to-[#2c5364] py-10">
      <h2 class="text-3xl font-extrabold text-cyan-300 tracking-widest uppercase mb-8 items-center ">${t("dashboard.edit_profile")}</h2>
      <div class="w-full max-w-[1800px] mx-auto flex flex-col md:flex-row gap-10">
        <div class="flex-[2] bg-cyan-900/30 rounded-2xl shadow-lg border border-cyan-400/20 p-4 flex flex-col">
          <form id="edit-profile-form" class="flex flex-col gap-6">
          <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">${t("dashboard.login")}</label>
          <input name="login" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" required />
          </div>
          <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">${t("dashboard.email")}</label>
          <input name="email" type="email" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" required />
          </div>
          <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">${t("dashboard.alias")}</label>
          <input name="alias" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" />
          </div>
          <input type="hidden" name="avatar">
          <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">${t("dashboard.avatar")}</label>
          <input type="file" id="avatar-upload" accept="image/*" class="mt-2" />
          <img id="avatar-preview" src="" alt="${t("dashboard.avatar_preview")}" class="mt-2 w-20 h-20 rounded-full border border-cyan-400" style="display:none;" />
          </div>
          <button type="submit" class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition">${t("dashboard.save")}</button>
          <div id="edit-profile-message" class="mt-4 text-cyan-200"></div>
          </form>
        </div>
        <div class="flex-[1.3] bg-cyan-900/30 rounded-2xl shadow-lg border border-cyan-400/20 p-4 flex flex-col">
          <div class="w-full flex flex-col items-center ">
            <div id="profile-info"></div>
          </div>
          <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">${t("dashboard.2fa")}</label>
          <div id="2fa-section" class="flex items-center gap-4">
          <span id="2fa-status" class="text-cyan-300">${t("dashboard.loading")}</span>
          <button id="2fa-toggle-btn" type="button" class="bg-cyan-600 hover:bg-cyan-400 text-white px-4 py-1 rounded-lg shadow transition">...</button>
          </div>
        </div>
        <label class="block font-semibold mb-1 text-cyan-200">${t("dashboard.mdpModif")}</label>
        <form id="new-mdp" class="flex flex-col gap-2 p-0">
          <div class="mb-1">
            <label class="block font-semibold mb-1 text-cyan-300">${t("dashboard.mdp")}</label>
            <input name="mdp" type="password" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-1 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" required />
          </div>
          <div class="mb-1">
            <label class="block font-semibold mb-1 text-cyan-300">${t("dashboard.new_Mdp")}</label>
            <input name="newMdp" type="password" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-1 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" required />
          </div>
          <div class="mb-1">
            <label class="block font-semibold mb-1 text-cyan-300">${t("dashboard.confirm_mdp")}</label>
            <input name="newMdp2" type="password" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-1 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" />
          </div>
          <button type="submit" class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-2 py-1 rounded shadow-cyan-400/30 shadow transition">${t("dashboard.save")}</button>
          <div id="new-mdp" class="mt-1 text-cyan-200"></div>
        </form>
        </div>
      </div>
      <a href="/dashboard" class="text-cyan-400 underline mt-4 inline-block">${t("dashboard.back_profile")}</a>
    </div>
  `;
}

function update2FAStatus(user: any) {
  const status = document.getElementById("2fa-status");
  const btn = document.getElementById("2fa-toggle-btn") as HTMLButtonElement | null;
  if (!status || !btn) return;
  const is2FA = !!user.tfa_enabled;
  status.textContent = is2FA ? t("dashboard.2fa_enabled") : t("dashboard.2fa_disabled");
  btn.textContent = is2FA ? t("dashboard.2fa_disable") : t("dashboard.2fa_enable");
}

export function attachDashboardEditEvents() {
  window.requestAnimationFrame(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigateTo("/login");
      return;
    }
    
fetch("/api/users/me", {
  headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(user => {
    const status = document.getElementById("2fa-status");
    const btn = document.getElementById("2fa-toggle-btn") as HTMLButtonElement | null;
    if (!status || !btn) return;
    const is2FA = !!user.tfa_enabled;
    status.textContent = is2FA ? t("dashboard.2fa_enabled") : t("dashboard.2fa_disabled");
    btn.textContent = is2FA ? t("dashboard.2fa_disable") : t("dashboard.2fa_enable");

    // Ajout sécurisé du listener (une seule fois)
    if (!btn.dataset.listener) {
      btn.onclick = async () => {
        btn.disabled = true;
        status.textContent = t("dashboard.processing");
        const currentUserRes = await fetch("/api/users/me", {
          headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
        });
        const currentUser = await currentUserRes.json();
        const is2FA = !!currentUser.tfa_enabled;
        try {
          const res = await fetch(`/api/users/${is2FA ? "disable-2fa" : "enable-2fa"}`, {
            method: "POST",
            headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userRes = await fetch("/api/users/me", {
              headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
            });
            const user = await userRes.json();
            update2FAStatus(user);
          } else {
            status.textContent = t("dashboard.error");
          }
        } catch {
          status.textContent = t("dashboard.error");
        }
        btn.disabled = false;
      };
    }
  });

  const formMdp = document.getElementById("new-mdp") as HTMLFormElement | null;
  if (formMdp) {

    (formMdp.elements.namedItem("mdp") as HTMLInputElement).value = "";
    (formMdp.elements.namedItem("newMdp") as HTMLInputElement).value = "";
    (formMdp.elements.namedItem("newMdp2") as HTMLInputElement).value = "";

    formMdp.onsubmit = async (e) => {
      e.preventDefault();
	  const mdp = (formMdp.elements.namedItem("mdp") as HTMLInputElement).value;
	  const newMdp = (formMdp.elements.namedItem("newMdp") as HTMLInputElement).value;
	  const newMdp2 = (formMdp.elements.namedItem("newMdp2") as HTMLInputElement).value;
      const msg = document.getElementById("edit-profile-message");
      if (newMdp == newMdp2)
      {
        try {
          const res = await fetch("/api/users/me/password", {
            method: "PATCH",
            headers: {
              "Accept-Language": localStorage.getItem("lang") || "fr",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword: mdp, newPassword: newMdp })
          });
          if (res.ok) {
            msg!.textContent = t("dashboard.mdp_updated");
            msg!.className = "mt-2 text-green-500";
          } else {
            const data = await res.json();
            msg!.textContent = data.error || t("dashboard.error_update");
            msg!.className = "mt-2 text-red-400";
          }
        } catch {
          msg!.textContent = t("dashboard.network_error");
          msg!.className = "mt-2 text-red-400";
        }
      }
      else
      {
        msg!.textContent = t("dashboard.network_error");
        msg!.className = "mt-2 text-red-400";
      }
    };
  }


    
    fetch("/api/users/profil", {
      headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(user => {
        const form = document.getElementById("edit-profile-form") as HTMLFormElement | null;
        if (form && user) {
          (form.elements.namedItem("login") as HTMLInputElement).value = escapeHTML(user.login) || "";
          (form.elements.namedItem("alias") as HTMLInputElement).value = escapeHTML(user.alias) || "";
          (form.elements.namedItem("email") as HTMLInputElement).value = escapeHTML(user.email) || "";
          (form.elements.namedItem("avatar") as HTMLInputElement).value = user.avatar || "";
        }
        const info = document.getElementById("profile-info");
        if (info) {
          if (user.avatar)
            info.innerHTML = `
            <div class="relative">
              <img src="${user.avatar}" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg mb-4 object-cover" />
              <button
                id="avatar-delete"
                type="button"
                aria-label="Supprimer l’avatar"
                class="absolute top-1 right-1 text-4xl leading-none text-red-600 bg-transparent border-none shadow-none p-0 m-0 select-none outline-none focus:outline-none hover:bg-transparent active:bg-transparent appearance-none"
                style="all: unset; position: absolute; top: 0.25rem; right: 0.25rem; color: #dc2626; font-size: 2.2rem; line-height: 0; cursor: pointer; user-select: none;"
              >
                &times;
              </button>
            </div>
            `;
          else
            info.innerHTML = `<img src="${"/uploads/default-avatar.png"}" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-lg mb-4 object-cover" />`;
          const deleteAvatar = document.getElementById("avatar-delete");
          if (deleteAvatar)
          {
            deleteAvatar.addEventListener("click", async () => {
              const token = localStorage.getItem("token");
              const res = await fetch("/api/users/reset-avatar", {
                method: "POST",
                headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` },
              } as any);
              if (res.ok) {
                localStorage.removeItem("userAvatar");
                navigateTo("/dashboard");
              } else {
                const text = await res.text();
                alert(t("dashboard.error_avatar_upload") + text);
                return;
              }
            });
          }
        }
      });
    const avatarInput = document.getElementById("avatar-upload") as HTMLInputElement;
    const avatarPreview = document.getElementById("avatar-preview") as HTMLImageElement;

    if (avatarInput) {
      avatarInput.onchange = async () => {
        const file = avatarInput.files?.[0];
        if (!file) return;
        avatarPreview.src = URL.createObjectURL(file);
        avatarPreview.style.display = "block";
      }
    }

    const form = document.getElementById("edit-profile-form") as HTMLFormElement | null;
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const login = (form.login as HTMLInputElement).value;
        const alias = (form.alias as HTMLInputElement).value;
        const email = (form.email as HTMLInputElement).value;
        let avatar = (form.avatar as HTMLInputElement).value;

        const file = avatarInput.files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append("avatar", file);
          const token = localStorage.getItem("token");
          const res = await fetch("/api/users/upload-avatar", {
            method: "POST",
            headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` },
            body: formData,
          } as any);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              avatar = data.url;
            }
          } else {
            const text = await res.text();
            alert(t("dashboard.error_avatar_upload") + text);
            return;
          }
        }

        const msg = document.getElementById("edit-profile-message");
        try {
          const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: {
              "Accept-Language": localStorage.getItem("lang") || "fr",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ login, alias, email, avatar })
          });
          if (res.ok) {
            msg!.textContent = t("dashboard.profile_updated");
            msg!.className = "mt-2 text-green-500";
            localStorage.setItem("userLogin", login);
            localStorage.setItem("userAlias", alias);
            localStorage.setItem("userAvatar", avatar);
            setTimeout(() => {
              navigateTo("/dashboard");
            }, 1000);
          } else {
            const data = await res.json();
            msg!.textContent = data.error || t("dashboard.error_update");
            msg!.className = "mt-2 text-red-400";
          }
        } catch {
          msg!.textContent = t("dashboard.network_error");
          msg!.className = "mt-2 text-red-400";
        }
      };
    }
  });
}