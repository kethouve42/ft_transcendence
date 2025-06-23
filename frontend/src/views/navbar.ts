import { navigateTo } from "../main";
import { t, getLang, setLang, LANG_NAMES } from "../i18n";
export function navbarView(): string {
  const isLogged = !!localStorage.getItem("token");
  const userLogin = localStorage.getItem("userLogin");
  const userAlias = localStorage.getItem("userAlias");
  const userAvatar = localStorage.getItem("userAvatar");
  const currentPath = window.location.pathname;

  function linkClass(path: string, base: string) {
    const active =
      currentPath === path
        ? "text-blue-600 font-semibold border-b-2 border-blue-600"
        : "";
    return `${base} ${active}`.trim();
  }

  return `
    <nav class="w-full px-6 md:px-32 py-4 bg-cyan-950/80 flex items-center justify-between shadow-lg z-50">
      <div class="flex items-center gap-10">
        <a href="/" class="${linkClass("/", "text-lg font-extrabold tracking-widest text-cyan-300 hover:text-cyan-400 transition")}">${t("nav.home")}</a>
        <a href="/game" class="${linkClass("/game", "text-lg font-extrabold tracking-widest text-cyan-300 hover:text-cyan-400 transition")}">${t("nav.game")}</a>
        <a href="/clicker" class="${linkClass("/clicker", "text-lg font-extrabold tracking-widest text-cyan-300 hover:text-cyan-400 transition")}">${t("nav.clicker")}</a>      </div>
      <div class="flex items-center gap-6">
        <!-- Ajoute le sélecteur de langue -->
        <select id="lang-switcher" class="bg-cyan-900 border border-cyan-400 text-cyan-200 rounded px-2 py-1">
          ${Object.entries(LANG_NAMES).map(([k, v]) =>
            `<option value="${k}" ${getLang() === k ? "selected" : ""}>${v}</option>`
          ).join("")}
        </select>
        ${
          isLogged
            ? `
              <a href="/dashboard" class="flex items-center gap-2 font-semibold text-cyan-200 hover:text-cyan-400 transition">
                <span class="inline-block w-9 h-9 rounded-full bg-cyan-900 border-2 border-cyan-400 shadow-cyan-400/40 shadow-lg overflow-hidden">
                <img
                  src="${userAvatar || 'http://localhost:3000/uploads/avatars/default-avatar.png'}"
                  alt="avatar"
                  class="w-9 h-9 rounded-full border-2 border-cyan-400 shadow-cyan-400/40 shadow-lg object-cover bg-cyan-900"
                />
                </span>
                <span class="uppercase tracking-wider">${userAlias || userLogin || "Profil"}</span>
              </a>
              <button id="logout-btn" class="bg-cyan-700/80 text-white border border-cyan-400 px-5 py-2 rounded-full font-semibold shadow-cyan-400/30 shadow-md hover:bg-cyan-500/80 hover:text-black transition">
                ${t("nav.logout")}
              </button>
            `
            : `
              <a href="/login" class="${linkClass("/login", "text-lg font-semibold text-cyan-200 hover:text-cyan-400 transition")}">${t("nav.login")}</a>
              <a href="/register" class="${linkClass("/register", "text-lg font-semibold text-cyan-200 hover:text-cyan-400 transition")}">${t("nav.register")}</a>
            `
        }
      </div>
    </nav>
  `;
}

export function attachNavbarEvents() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogin");
      localStorage.removeItem("userAlias");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("userId");
      navigateTo("/login");
    });
  }
  const langSel = document.getElementById("lang-switcher") as HTMLSelectElement | null;
  if (langSel) {
    langSel.onchange = () => setLang(langSel.value as any);
  }
}