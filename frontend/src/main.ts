import "./css/index.css";
import { loginView, attachLoginEvents } from "./views/login";
import { dashboardMainView, attachDashboardMainEvents } from "./views/dashboard";
import { registerView, attachRegisterEvents } from "./views/register";
import { homeView, attachHomeEvents } from "./views/home";
import { profileView, attachProfileEvents } from "./views/profile";
import { navbarView, attachNavbarEvents } from "./views/navbar";
import { renderError, attachErrorEvents } from "./views/error";

// Ajoute ici toutes les routes de ton app
type RouteHandler = (params?: any) => string | Promise<string>;

const routes: Record<string, RouteHandler> = {
  "/": homeView,
  "/login": loginView,
  "/dashboard": dashboardMainView,
  "/register": registerView,
  "/error": renderError,
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
      // Token expiré ou invalide : on nettoie tout et on redirige
      localStorage.removeItem("token");
      localStorage.removeItem("userLogin");
      localStorage.removeItem("userAlias");
      localStorage.removeItem("userAvatar");
      window.location.href = "/login";
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
  ];
  const token = localStorage.getItem("token");
  if (protectedRoutes.includes(route) && !token) {
    navigateTo("/login");
    return;
  }

  const protectedRoutes_lr = [
    "/login",
    "/register",
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
}

export function attachLinkHandlers() {
  document.querySelectorAll("a[href]").forEach(link => {
    // On clone le lien pour supprimer tous les anciens listeners
    const newLink = link.cloneNode(true) as HTMLAnchorElement;
    link.parentNode?.replaceChild(newLink, link);

    newLink.addEventListener("click", e => {
      const href = newLink.getAttribute("href");
      if (href && href.startsWith("/")) {
        e.preventDefault();
        history.pushState({}, "", href);
        render(href);
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