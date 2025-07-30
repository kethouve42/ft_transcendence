import "./css/index.css";
import { t } from "./i18n";
import { loginView, attachLoginEvents } from "./views/login";
import { dashboardMainView, attachDashboardMainEvents } from "./views/dashboard";
import { registerView, attachRegisterEvents } from "./views/register";
import { profileView, attachProfileEvents } from "./views/profile";
import { navbarView, attachNavbarEvents } from "./views/navbar";
import { renderError, attachErrorEvents } from "./views/error";
import { clickerView, clickerEvent } from "./views/clicker/clicker";
import { gameViews, gameEvent} from "./views/game/game"
import { loginPlayer2View, attachLoginPlayer2Events } from "./views/login_player2"
import { privacyView, attachPrivacyEvents } from "./views/privacy";
import { loginTournamentView, attachLoginTournamentEvents } from "./views/game/loginTournament"
import { registerRedirectView, attachRegisterRedirectEvents } from "./views/register_Redirect";
import { resetPasswordView, resetPasswordEvents } from "./views/reset_password"
import { mailConfirmView, mailConfirmEvents } from "./views/mail_confirm";
import { renderHome, attachHomeEvents } from "./views/home";


let isClickListenerAttached = false;

type RouteConfig = {
  view: () => string;
  events?: () => void;
};


//table des page a afficher en fonction url
const route: Record<string, RouteConfig> = {
  "/": { view: renderHome, events: attachHomeEvents },
  "/login": { view: loginView, events: attachLoginEvents },
  "/dashboard": { view: dashboardMainView, events: attachDashboardMainEvents },
  "/register": { view: registerView, events: attachRegisterEvents },
  "/error": { view: renderError, events: attachErrorEvents },
  "/clicker": { view: clickerView, events: clickerEvent },
  "/pong": { view: gameViews, events: gameEvent },
  "/loginUser2": { view: loginPlayer2View, events: attachLoginPlayer2Events },
  "/privacy": { view: privacyView, events: attachPrivacyEvents },
  "/loginTournament" : { view: loginTournamentView, events: attachLoginTournamentEvents },
  "/reset-password" : { view: resetPasswordView, events: resetPasswordEvents },
  "/registerRedirect": { view: registerRedirectView, events: attachRegisterRedirectEvents },
  "/verify-email": { view: mailConfirmView, events: mailConfirmEvents },
}

const routeProtectedLog = [
  "/clicker",
  "/pong",
  "/dashboard"
]

const routeProtectedNotLog = [
  "/login",
]

const routeDynamiques = [
  "/reset-password",
  "/verify-email",
]

const routeDynamiquesurl = [
  "loginUser2",
  "registerRedirect",
]
//system pour lier l'url a l'affichage
function renderRoute(url: string)
{
  const token = localStorage.getItem("token");
  ping();
  let contentFunction;
  let eventsFunction;
  const urlsplit = url.split("/")[1];
  const urlsplit2 = urlsplit.split("?")[0];
  console.log ("1", urlsplit, urlsplit2);
  if (urlsplit === "profile")
  {
    contentFunction = () => profileView(escapeHTML(url.split("/")[2]));
    eventsFunction = () => attachProfileEvents(escapeHTML(url.split("/")[2]));
  }
  else if (routeDynamiques.includes(urlsplit))
  {
    contentFunction = route[urlsplit].view;
    eventsFunction = route[urlsplit].events;
  }
  else if (routeDynamiquesurl.includes(urlsplit2))
  {
    console.log (urlsplit, urlsplit2);
    contentFunction = route["/"+urlsplit2].view;
    eventsFunction = route["/"+urlsplit2].events;
  }
  else if (url in route)
  {
    if (routeProtectedLog.includes(url) && !token)
    {
      navigateTo("/login");
      return;
    }
    else if (routeProtectedNotLog.includes(url) && token)
    {
      navigateTo("/dashboard");
      return;
    }
    else
    {
      contentFunction = route[url].view;
      eventsFunction = route[url].events;
    }
  }
  else
  {
    contentFunction = route["/error"].view;
    eventsFunction = route["/error"].events;
  }
  const contenuHTML = contentFunction();
  const app = document.getElementById("app");
  if (app) {
  app.innerHTML = contenuHTML;
  }
  if (eventsFunction) {
    eventsFunction();
  }
  updateNavbar();
}
//maj de la navbar
export function updateNavbar()
{
  const navbar = document.getElementById("navbar");
  if (navbar)
  {
    const navbarHTML = navbarView();
    navbar.innerHTML = navbarHTML;
    attachNavbarEvents();
  }
}
//interception des lien
export function attachLinkHandlers()
{
  if (isClickListenerAttached) return;
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a');
    if (link)
    {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/'))
      {
        event.preventDefault();
        window.history.pushState(null, '', href);
        renderRoute(href);
      }
    }
  });
  isClickListenerAttached = true;
}
//si tu joue avec l'historique
window.addEventListener('popstate', () => {
  renderRoute(window.location.pathname);
});


//afficher page / navbar
renderRoute(window.location.pathname);
updateNavbar();
attachLinkHandlers()


//pour faire bien les deplacement
export function navigateTo(url: string): void {
  window.history.pushState(null, '', url);
  renderRoute(url);
}


//ping le back et verif si token valide
function ping()
{
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("/api/users/ping",
  {
    method: "PUT",
    headers: { "Accept-Language": localStorage.getItem("lang") || "fr", Authorization: `Bearer ${token}` }
  })
  .then(reponse =>
  {
    if (reponse.status === 401)
    {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogin");
      localStorage.removeItem("userAlias");
      localStorage.removeItem("userAvatar");
      navigateTo("/");
    }
  })
  .catch(() => {});
}
setInterval(ping, 1000);

//eviter injection
export function escapeHTML(str: string) {
  if (!str)
    return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


//navigateTo assecible de partous
declare global {
  interface Window {
    navigateTo: (url: string) => void;
    t: (path: string) => string;
  }
}

window.t = t;
window.navigateTo = navigateTo;
