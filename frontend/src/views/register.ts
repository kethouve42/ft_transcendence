import { navigateTo } from "../main";
import { t } from "../i18n";

export function registerView(): string {
  return `
    <div class="register-container">
      <div class="card-main w-full max-w-xl mx-auto">
        <h2 class="text-3xl font-extrabold text-cyan-300 mb-8 text-center uppercase tracking-widest">${t("register.title")}</h2>
        <form id="register-form" class="flex flex-col gap-6">
          <input
            type="text"
            name="login"
            placeholder="${t("register.login")}"
            required
            class="input-main w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="${t("register.email")}"
            required
            class="input-main w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="${t("register.password")}"
            required
            class="input-main w-full"
          />
          <button
            type="submit"
            class="btn-main w-full"
          >
            ${t("register.submit")}
          </button>
          <div id="register-message" class="text-cyan-200"></div>
        </form>
      </div>
    </div>
  `;
}

export function attachRegisterEvents() {
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
        navigateTo("/login");
      }, 1000);
    } catch (err: any) {
      if (msg) msg.textContent = t("register.error_add") + err.message;
    }
  };
}