import { navigateTo } from "../main";

export function loginView(): string {
  return `
    <div class="max-w-md mx-auto mt-12 bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 backdrop-blur-md">
      <h2 class="text-2xl font-bold mb-6 text-cyan-300 tracking-widest uppercase">Connexion</h2>
      <form id="login-form" class="flex flex-col gap-6">
        <input
          type="text"
          name="login"
          placeholder="Login/Email"
          required
          class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          required
          class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
        />
        <div id="2fa-field" style="display:none;">
          <input
            type="text"
            name="code2fa"
            placeholder="Code 2FA"
            maxlength="6"
            class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow mt-2"
          />
        </div>
        <button
          type="submit"
          class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition"
        >
          Se connecter
        </button>
        <div id="login-message" class="text-red-400"></div>
      </form>
      <a href="/register" class="text-cyan-400 underline mt-4 inline-block">Créer un compte</a>
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
        msg!.textContent = "Erreur interne : identifiant manquant.";
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
          msg!.textContent = data.error || "Code 2FA incorrect";
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("userLogin", data.login || "");
        localStorage.setItem("userAlias", data.alias || "");
        localStorage.setItem("userAvatar", data.avatar || "");
        navigateTo("/dashboard");
      } catch (err: any) {
        msg!.textContent = "Erreur lors de la connexion 2FA : " + err.message;
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
	  console.log("Infos utilisateur récupérées :", data);
      if (data.step === "2fa_required") {
        if (field2fa) field2fa.style.display = "";
        identifierFor2FA = data.identifier;
        localStorage.setItem("2fa_identifier", data.identifier);
        msg!.textContent = "Veuillez entrer le code 2FA reçu.";
        return;
      }
      if (!res.ok || !data.token) {
        msg!.textContent = data.error || "Identifiants incorrects";
        return;
      }
      // Connexion classique
      localStorage.setItem("token", data.token);
      localStorage.setItem("userLogin", data.login || "");
      localStorage.setItem("userAlias", data.alias || "");
      localStorage.setItem("userAvatar", data.avatar || "");
      navigateTo("/dashboard");
    } catch (err: any) {
      msg!.textContent = "Erreur lors de la connexion : " + err.message;
    }
  };
}