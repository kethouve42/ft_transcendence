import { dashboardView, attachDashboardViewEvents } from "./dashboard_view";
import { dashboardEditView, attachDashboardEditEvents } from "./dashboard_edit";
import { dashboardFriendsView, attachDashboardFriendsEvents } from "./dashboard_friends";
import { attachLinkHandlers } from "../main";
import { t } from "../i18n";

// Liste des sections disponibles
const sections = [
  { key: "view", label: t("dashboard.view") },
  { key: "edit", label: t("dashboard.edit") },
  { key: "friends", label: t("dashboard.friends") },
];

// Vue principale du dashboard avec navigation simple (sans React)
export function dashboardMainView(): string {
  return `
    <div class="w-full min-h-screen px-8 md:px-32">
      <div class="flex gap-4 mb-6" id="dashboard-menu">
        ${sections
          .map(
            (s) => `
            <button 
              id="dashboard-menu-${s.key}" 
              class="dashboard-menu-btn bg-cyan-600 text-white px-4 py-2 rounded transition"
              data-section="${s.key}"
            >${s.label}</button>
          `
          )
          .join("")}
      </div>
      <div id="dashboard-content"></div>
    </div>
  `;
}

// Attache les events pour le dashboard (navigation entre les sous-vues)
export function attachDashboardMainEvents() {
  // Par défaut, affiche la vue "voir"
  renderDashboardSection("view");

  // Navigation boutons
  const menu = document.getElementById("dashboard-menu");
  if (menu) {
    menu.querySelectorAll<HTMLButtonElement>(".dashboard-menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = btn.dataset.section as "view" | "edit" | "friends";
        renderDashboardSection(section);
        updateActiveMenu(section);
      });
    });
    // Met à jour l'état actif initial
    updateActiveMenu("view");
  }
}

// Met à jour la classe active sur le bouton sélectionné
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

// Fonction utilitaire pour afficher une sous-vue du dashboard
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