import { navigateTo } from "../main";
import { t } from "../i18n";

export function dashboardEditView(): string {
  return `
    <div class="w-full max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
      <h2 class="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">${t("dashboard.edit_profile")}</h2>
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
        <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">${t("dashboard.2fa")}</label>
          <div id="2fa-section" class="flex items-center gap-4">
            <span id="2fa-status" class="text-cyan-300">${t("dashboard.loading")}</span>
            <button id="2fa-toggle-btn" type="button" class="bg-cyan-600 hover:bg-cyan-400 text-white px-4 py-1 rounded-lg shadow transition">
              ...
            </button>
          </div>
        </div>
        <button type="submit" class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition">${t("dashboard.save")}</button>
        <div id="edit-profile-message" class="mt-4 text-cyan-200"></div>
      </form>
      <section>
        <button onclick="toggleContrast()">Contraste élevé</button>
        <button onclick="changeFontSize(2)">A+</button>
        <button onclick="changeFontSize(-2)">A-</button>
      </section>
      <a href="/dashboard" class="text-cyan-400 underline mt-4 inline-block">${t("dashboard.back_profile")}</a>
    </div>
  `;
}

export function attachDashboardEditEvents() {
  window.requestAnimationFrame(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigateTo("/login");
      return;
    }
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(user => {
        const status = document.getElementById("2fa-status");
        const btn = document.getElementById("2fa-toggle-btn") as HTMLButtonElement | null;
        if (!status || !btn) return;
        const is2FA = !!user.tfa_enabled;
        status.textContent = is2FA ? t("dashboard.2fa_enabled") : t("dashboard.2fa_disabled");
        btn.textContent = is2FA ? t("dashboard.2fa_disable") : t("dashboard.2fa_enable");

        btn.onclick = async () => {
          btn.disabled = true;
          status.textContent = t("dashboard.processing");
          try {
            const res = await fetch(`/api/users/${is2FA ? "disable-2fa" : "enable-2fa"}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const userRes = await fetch("/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
              });
              const user = await userRes.json();
              const is2FA = !!user.tfa_enabled;
              status.textContent = is2FA ? t("dashboard.2fa_enabled") : t("dashboard.2fa_disabled");
              btn.textContent = is2FA ? t("dashboard.2fa_disable") : t("dashboard.2fa_enable");
            } else {
              status.textContent = t("dashboard.error");
            }
          } catch {
            status.textContent = t("dashboard.error");
          }
          btn.disabled = false;
        };
      });
    fetch("/api/users/profil", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(user => {
        const form = document.getElementById("edit-profile-form") as HTMLFormElement | null;
        if (form && user) {
          (form.elements.namedItem("login") as HTMLInputElement).value = user.login || "";
          (form.elements.namedItem("alias") as HTMLInputElement).value = user.alias || "";
          (form.elements.namedItem("email") as HTMLInputElement).value = user.email || "";
          (form.elements.namedItem("avatar") as HTMLInputElement).value = user.avatar || "";
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
            headers: { Authorization: `Bearer ${token}` },
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