import { navigateTo } from "../main";
import { t } from "../i18n";

export function registerRedirectView(): string {
  return `
    <div class="w-full min-h-[50vh] px-8 md:px-32 flex items-center justify-center pt-8">
      <div class="w-full max-w-xl mx-auto bg-cyan-900/60 border-2 border-cyan-400/30 rounded-2xl shadow-2xl p-10 backdrop-blur-md">
        <h2 class="text-3xl font-extrabold text-cyan-300 mb-8 text-center uppercase tracking-widest">${t("register.title")}</h2>
        <form id="register-form" class="flex flex-col gap-6">
          <input
            type="text"
            name="login"
            placeholder="${t("register.login")}"
            required
            class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
          />
          <input
            type="email"
            name="email"
            placeholder="${t("register.email")}"
            required
            class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
          />
          <input
            type="password"
            name="password"
            placeholder="${t("register.password")}"
            required
            class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
          />
          <button
            type="submit"
            class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition w-full"
          >
            ${t("register.submit")}
          </button>
          <div id="register-message" class="text-cyan-200"></div>
        </form>
      </div>
    </div>
  `;
}

export function attachRegisterRedirectEvents() {
  const form = document.getElementById("register-form") as HTMLFormElement | null;
  const msg = document.getElementById("register-message");
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = "";
    const login = (form.login as HTMLInputElement).value;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
        body: JSON.stringify({ login, email, password }),
      });
      if (!res.ok) throw new Error(t("register.error_api") + res.status);
      if (msg) msg.textContent = t("register.success");
      form.reset();
      setTimeout(() => {
        navigateTo(getRedirectUrl());
      }, 1000);
    } catch (err: any) {
      if (msg) msg.textContent = t("register.error_add") + err.message;
    }
  };
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "/";
}