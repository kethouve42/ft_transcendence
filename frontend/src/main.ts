import "./css/index.css";
import { loginView, attachLoginEvents } from "./views/login";
import { dashboardMainView, attachDashboardMainEvents } from "./views/dashboard";
import { registerView, attachRegisterEvents } from "./views/register";
import { profileView, attachProfileEvents } from "./views/profile";
import { navbarView, attachNavbarEvents } from "./views/navbar";
import { renderError, attachErrorEvents } from "./views/error";
import { clickerView, clickerEvent } from "./views/clicker/clicker";
import { gameViews, gameEvent} from "./views/game/game"
import { loginPlayer2View, attachLoginPlayer2Events } from "./views/login_player2"
import { privacyView } from "./views/privacy";
import { loginTournamentView, attachLoginTournamentEvents } from "./views/game/loginTournament"
import { registerRedirectView, attachRegisterRedirectEvents } from "./views/register_Redirect";
import { resetPasswordView, resetPasswordEvents } from "./views/reset_password"
import { mailConfirmView, mailConfirmEvents } from "./views/mail_confirm";
import { renderHome, attachHomeEvents } from "./views/home";
import { t } from "./i18n";

type RouteHandler = (params?: any) => string | Promise<string>;

const routes: Record<string, RouteHandler> = {
  "/": renderHome,
  "/login": loginView,
  "/dashboard": dashboardMainView,
  "/register": registerView,
  "/error": renderError,
  "/clicker": clickerView,
  "/pong": gameViews,
  "/loginUser2": loginPlayer2View,
  "/privacy": privacyView,
  "/loginTournament" : loginTournamentView,
  "/reset-password" : resetPasswordView,
  "/registerRedirect": registerRedirectView,
  "/verify-email": mailConfirmView,
};

function pingUser() {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("/api/users/ping", {
    method: "PUT",
    headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
  })
  .then(res => {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogin");
      localStorage.removeItem("userAlias");
      localStorage.removeItem("userAvatar");
      navigateTo("/");
    }
  })
  .catch(() => {});
}
setInterval(pingUser, 10000);

function render(route: string) {
  const app = document.getElementById("app");
  if (!app) return;

  const allowedPrefixes = ["/reset-password/", "/verify-email/"];

    const protectedRoutes = [
    "/dashboard",
    "/clicker",
    "/pong",
    "/loginUser2",
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

  const isAllowed = allowedPrefixes.some(prefix => route.startsWith(prefix));
  const handler = routes[route] || (isAllowed
    ? () => ""
    : () => {navigateTo("/error"); return "";}
  );
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
  if (route === "/reset-password") resetPasswordEvents()
  if (route === "/registerRedirect") attachRegisterRedirectEvents();
  if (route === "/verify-email") mailConfirmEvents();
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

export function showPopup(message: string, onConfirm: () => void) {

  const modal = document.createElement("div");
  modal.id = "confirm-modal";
  modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]";
  modal.innerHTML = `
    <div class="bg-cyan-900 rounded-2xl shadow-2xl border-2 border-cyan-400 p-8 flex flex-col items-center max-w-md w-full" role="dialog" aria-modal="true">
      <p class="text-cyan-200 mb-6">${message}</p>
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

    document.getElementById("confirm-yes")?.addEventListener("click", () => {
      modal.remove();
      onConfirm();
    });
    document.getElementById("confirm-no")?.addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirm-yes")?.focus();
}

(window as any).navigateTo = navigateTo;