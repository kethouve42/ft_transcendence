import { navigateTo } from "../main";
import { t } from "../i18n";

export function loginView(): string {
  return `
    <div class="max-w-md mx-auto mt-12 bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 backdrop-blur-md">
      <h2 class="text-2xl font-bold mb-6 text-cyan-300 tracking-widest uppercase">${t("login.title")}</h2>
      <form id="login-form" class="flex flex-col gap-6">
        <input
          type="text"
          name="login"
          placeholder="${t("login.username")}"
          required
          class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
        />
        <input
          type="password"
          name="password"
          placeholder="${t("login.password")}"
          required
          class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
        />
        <div id="2fa-field" style="display:none;">
          <input
            type="text"
            name="code2fa"
            placeholder="${t("login.code2fa")}"
            maxlength="6"
            class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow mt-2"
          />
        </div>
        <div class="flex gap-2 min-h-[1.25rem]">
          <input
            type="checkbox"
            id="stayConnected"
            name="stayConnected"
            class="accent-cyan-500 w-5 h-5 border border-cyan-400 rounded focus:ring-2 focus:ring-cyan-400"
          />
          <label for="stayConnected" class="text-cyan-200 cursor-pointer select-none h-5 flex items-center">
            ${t("login.stayConnected")}
          </label>
        </div>
        <div class="flex justify-between items-center">
          <a id="forgot-password" class="text-cyan-400 hover:text-cyan-200 underline" aria-label="${t("login.forgot_password")}"> ${t("login.forgot_password")} </a>
        </div>
        <button
          type="submit"
          class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition"
        >
          ${t("login.submit")}
        </button>
        <div id="login-message" class="text-red-400"></div>
      </form>
      <a href="/register" class="text-cyan-400 underline mt-4 inline-block">${t("login.register")}</a>
    </div>
  `;
}

export function attachLoginEvents() {
  const forgotPassword = document.getElementById("forgot-password");
  if (forgotPassword)
  {
    forgotPassword.onclick = () => {
      forgotPasswordPopup();
    }
  }

  const form = document.getElementById("login-form") as HTMLFormElement | null;
  const msg = document.getElementById("login-message");
  const field2fa = document.getElementById("2fa-field") as HTMLDivElement | null;
  if (!form) return;
  let identifierFor2FA: string | null = null;

  form.onsubmit = async (e) => {
    e.preventDefault();
    msg!.textContent = "";

    // Si le champ 2FA est visible, on tente la connexion 2FA
    if (field2fa && field2fa.style.display !== "none") {
      const code = (form.code2fa as HTMLInputElement).value;
      const identifier = identifierFor2FA || localStorage.getItem("2fa_identifier");
      if (!identifierFor2FA || identifier === "undefined") {
        msg!.textContent = t("login.error_internal");
        return;
      }
      try {
        const res = await fetch("/api/users/auth/2fa", {
          method: "POST",
          headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, code }),
        });
        const data = await res.json();
        if (!res.ok || !data.token) {
          msg!.textContent = data.error || t("login.error_2fa");
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("userLogin", data.login || "");
        localStorage.setItem("userAlias", data.alias || "");
        localStorage.setItem("userAvatar", data.avatar || "");
        localStorage.removeItem("2fa_identifier");
        navigateTo("/dashboard");
      } catch (err: any) {
        msg!.textContent = t("login.error_2fa_connexion") + " " + err.message;
      }
      return;
    }

    // Sinon, tentative de connexion classique
    const login = (form.login as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;
    const stayConnected = (form.stayConnected as HTMLInputElement).checked;

    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: login, password, stayConnected }),
      });
      const data = await res.json();
      if (data.step === "2fa_required") {
        if (field2fa) field2fa.style.display = "";
        identifierFor2FA = data.identifier;
        localStorage.setItem("2fa_identifier", data.identifier);
        msg!.textContent = t("login.need2fa");
        return;
      }
      if (!res.ok || !data.token) {
        msg!.textContent = data.error || t("login.error");
        return;
      }
      // Connexion classique
      localStorage.setItem("token", data.token);
      if (data.UserId)
        localStorage.setItem("userId", data.UserId.toString())
      localStorage.setItem("userLogin", data.login || "");
      localStorage.setItem("userAlias", data.alias || "");
      localStorage.setItem("userAvatar", data.avatar || "");
      localStorage.removeItem("2fa_identifier");
      navigateTo("/dashboard");
    } catch (err: any) {
      msg!.textContent = t("login.error_connexion") + " " + err.message;
    }
  };
}

export function forgotPasswordPopup() {

  const modal = document.createElement("div");
  modal.id = "confirm-modal";
  modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]";
  modal.innerHTML = `
  <div class="bg-cyan-900 rounded-2xl shadow-2xl border-2 border-cyan-400 p-8 flex flex-col items-center max-w-md w-full" role="dialog" aria-modal="true" aria-label="${t("dashboard.confirmation")}">
  <p class="text-cyan-200 mb-6">${t("login.forgot_password_desc")}</p>
  <input type="email" id="forgot-email" placeholder="${t("login.email")}" class="bg-cyan-800 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow mb-4 w-full" required>
  <div id="forgot-message" class="text-red-400"></div>
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
  const msgForgot = document.getElementById("forgot-message");
    document.getElementById("confirm-yes")?.addEventListener("click", async () => {
      const emailInput = document.getElementById("forgot-email") as HTMLInputElement;
      try {
        const res = await fetch("/api/users/forgot-password", {
          method: "POST",
          headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.value }),
        })
        if (!res.ok) {
          throw new Error(t("login.error_email_required"));
        }
        msgForgot!.textContent = t("login.forgot_password_success");
        setTimeout(() => {
          modal.remove();
        }, 1000);
      } catch (err: any) {
        msgForgot!.textContent = err.message;
      }
    });
    document.getElementById("confirm-no")?.addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirm-yes")?.focus();
}