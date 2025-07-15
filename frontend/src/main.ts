import "./css/index.css";
import { loginView, attachLoginEvents } from "./views/login";
import { dashboardMainView, attachDashboardMainEvents } from "./views/dashboard";
import { registerView, attachRegisterEvents } from "./views/register";
import { homeView, attachHomeEvents } from "./views/home";
import { profileView, attachProfileEvents } from "./views/profile";
import { navbarView, attachNavbarEvents } from "./views/navbar";
import { renderError, attachErrorEvents } from "./views/error";
import { clickerView, clickerEvent } from "./views/clicker/clicker";
import { gameViews, gameEvent} from "./views/game/game"
import { loginPlayer2View, attachLoginPlayer2Events } from "./views/login_player2"
import { privacyView } from "./views/privacy";
import { loginTournamentView, attachLoginTournamentEvents } from "./views/game/loginTournament"

// Ajoute ici toutes les routes de ton app
type RouteHandler = (params?: any) => string | Promise<string>;

const routes: Record<string, RouteHandler> = {
  "/": homeView,
  "/login": loginView,
  "/dashboard": dashboardMainView,
  "/register": registerView,
  "/error": renderError,
  "/clicker": clickerView,
  "/pong": gameViews,
  "/loginUser2": loginPlayer2View,
  "/privacy": privacyView,
  "/loginTournament" : loginTournamentView,
};

function pingUser() {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("/api/users/ping", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogin");
      localStorage.removeItem("userAlias");
      localStorage.removeItem("userAvatar");
      navigateTo("/login");
    }
  })
  .catch(() => {});
}
setInterval(pingUser, 10000);

function render(route: string) {
  const app = document.getElementById("app");
  if (!app) return;

    const protectedRoutes = [
    "/dashboard",
    "/clicker",
    "/game",
  ];
  const token = localStorage.getItem("token");
  if (protectedRoutes.includes(route) && !token) {
    navigateTo("/login");
    return;
  }

  const protectedRoutes_lr = [
    "/login",
  ];
  if (protectedRoutes_lr.includes(route) && token) {
    navigateTo("/dashboard");
    return;
  }
  app.innerHTML = navbarView();
  if (route.startsWith("/profile/")) {
    const userId = route.split("/")[2];
    app.innerHTML += profileView(userId);
    attachNavbarEvents();
    attachProfileEvents(userId);
    attachLinkHandlers();
    return;
  }

  const handler = routes[route] || (() => {navigateTo("/error"); return "";});
  Promise.resolve(handler()).then(html => {
    app.innerHTML += html;
    attachEvents(route);
  });
}

function attachEvents(route: string) {
  attachNavbarEvents();
  attachLinkHandlers();
  if (route === "/") attachHomeEvents();
  if (route === "/login") attachLoginEvents();
  if (route === "/dashboard") attachDashboardMainEvents();
  if (route === "/register") attachRegisterEvents();
  if (route === "/error") attachErrorEvents();
  if (route === "/clicker") clickerEvent();
  if (route === "/pong") gameEvent();
  if (route === "/loginUser2") attachLoginPlayer2Events();
  if (route === "/loginTournament") attachLoginTournamentEvents()
}

export function attachLinkHandlers() {
  document.querySelectorAll("a[href]").forEach(link => {
    const newLink = link.cloneNode(true) as HTMLAnchorElement;
    link.parentNode?.replaceChild(newLink, link);

    newLink.addEventListener("click", e => {
      const href = newLink.getAttribute("href");
      if (href && href.startsWith("/")) {
        e.preventDefault();
        history.pushState({}, "", href);
        const url = new URL(href, window.location.origin);
        render(url.pathname);
      }
    });
  });
}

export function navigateTo(route: string) {
  window.history.pushState({}, "", route);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

window.onpopstate = () => render(location.pathname);
render(location.pathname);

let fontSize = 16;
function changeFontSize(delta: number) {
  fontSize = Math.max(12, fontSize + delta);
  document.body.style.setProperty('--base-font-size', `${fontSize}px`);
}

function toggleContrast() {
  document.body.classList.toggle('high-contrast');
}

export function escapeHTML(str: string) {
  if (!str)
    return
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

(window as any).toggleContrast = toggleContrast;
(window as any).changeFontSize = changeFontSize;