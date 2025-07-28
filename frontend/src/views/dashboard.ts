import { dashboardView, attachDashboardViewEvents } from "./dashboard_view";
import { dashboardEditView, attachDashboardEditEvents } from "./dashboard_edit";
import { dashboardFriendsView, attachDashboardFriendsEvents } from "./dashboard_friends";
import { attachLinkHandlers } from "../main";
import { t } from "../i18n";

function getSections() {
  return [
    { key: "view", label: t("dashboard.view") },
    { key: "edit", label: t("dashboard.edit") },
    { key: "friends", label: t("dashboard.friends") },
  ];
}

export function dashboardMainView(): string {
  const sections = getSections();
  return `
    <div class="w-full min-h-screen px-32">
      <div class="flex gap-4 mb-6" id="dashboard-menu">
        ${sections.map((s) => `<button id="dashboard-menu-${s.key}" class="dashboard-menu-btn btn-main px-4 py-2" data-section="${s.key}" >${s.label}</button>`).join("")}
      </div>
      <div id="dashboard-content"></div>
    </div>
  `;
}

export function attachDashboardMainEvents() {
  renderDashboardSection("view");

  const menu = document.getElementById("dashboard-menu");
  if (menu) {
    menu.querySelectorAll<HTMLButtonElement>(".dashboard-menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = btn.dataset.section as "view" | "edit" | "friends";
        renderDashboardSection(section);
        updateActiveMenu(section);
      });
    })
    updateActiveMenu("view");
  }
}

function updateActiveMenu(active: string) {
  document.querySelectorAll<HTMLButtonElement>(".dashboard-menu-btn").forEach((btn) => {
    if (btn.dataset.section === active) {
      btn.classList.add("bg-cyan-800", "font-bold", "border-b-2", "border-cyan-400");
      btn.classList.remove("bg-cyan-600");
    } else {
      btn.classList.remove("bg-cyan-800", "font-bold", "border-b-2", "border-cyan-400");
      btn.classList.add("bg-cyan-600");
    }
  });
}

function renderDashboardSection(section: "view" | "edit" | "friends") {
  const content = document.getElementById("dashboard-content");
  if (!content) return;

  if (section === "view") {
    content.innerHTML = dashboardView();
    attachDashboardViewEvents();
    attachLinkHandlers(); 
  } else if (section === "edit") {
    content.innerHTML = dashboardEditView();
    attachDashboardEditEvents();
    attachLinkHandlers(); 
  } else if (section === "friends") {
    content.innerHTML = dashboardFriendsView();
    attachDashboardFriendsEvents();
    attachLinkHandlers(); 
  }
}