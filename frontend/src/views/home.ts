import { t } from "../i18n";

export function homeView(): string {
  const count = Number(localStorage.getItem("homeCount") || 0);
  return `
    <div class="center-screen">
      <h1 class="text-4xl font-bold text-cyan-300 mb-6">
        ${t("welcome")}
      </h1>
      <div class="card p-8">
        <button
          id="kill-btn"
          class="btn-main"
        >
          ${t("home.kill")}
        </button>
        <div class="mt-4 text-lg">
          ${t("home.killed")}: <span id="kill-count" class="font-bold">${count}</span>
        </div>
      </div>
    </div>
  `;
}

export function attachHomeEvents() {
  const btn = document.getElementById("kill-btn");
  const countSpan = document.getElementById("kill-count");
  if (!btn || !countSpan) return;

  btn.addEventListener("click", () => {
    let count = Number(localStorage.getItem("homeCount") || 0);
    count++;
    localStorage.setItem("homeCount", String(count));
    countSpan.textContent = String(count);
  });
}