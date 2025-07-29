import { t } from "../i18n";

export function renderHome() {
  return `
    <div class="center-screen">
      <h1 class="text-6xl font-extrabold text-cyan-400 mb-4">404</h1>
      <p class="text-xl text-cyan-200 mb-8">${t("home.home")}</p>
    </div>
  `;
}

export function attachHomeEvents() {}