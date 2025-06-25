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
          headers: { "Content-Type": "application/json" },
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

    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: login, password }),
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