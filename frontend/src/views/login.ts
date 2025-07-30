import { navigateTo } from "../main";
import { t } from "../i18n";

export function loginView(): string {
  return `
    <div class="card-auth">
      <h2 class="title-auth">${t("login.title")}</h2>
      <form id="login-form" class="flex flex-col gap-6">
        <input
          type="text"
          name="login"
          placeholder="${t("login.username")}"
          required
          class="input-main"
        />
        <input
          type="password"
          name="password"
          placeholder="${t("login.password")}"
          required
          class="input-main"
        />
        <div id="2fa-field" style="display:none;">
          <input
            type="text"
            name="code2fa"
            placeholder="${t("login.code2fa")}"
            maxlength="6"
            class="input-main"
          />
        </div>
        <div class="flex gap-2 min-h-[1.25rem]">
          <input
            type="checkbox"
            id="stayConnected"
            name="stayConnected"
            class="accent-cyan-500 w-5 h-5 border border-cyan-400 rounded focus:ring-2 focus:ring-cyan-400"
          />
          <label for="stayConnected" class="text-cyan-200 cursor-pointer select-none h-5 flex items-center">
            ${t("login.stayConnected")}
          </label>
        </div>
        <div class="flex justify-between items-center">
          <a id="forgot-password" class="link-main mt-4 inline-block" "> ${t("login.forgot_password")} </a>
        </div>
        <button
          type="submit"
          class="btn-main"
        >
          ${t("login.submit")}
        </button>
        <div id="email_not_verified" style="display:none;">
          <a id="email_not_verified_bouton" class="link-main mt-4 inline-block" "> ${t("login.email_not_verified_bouton")} </a>
        </div>
        <div id="login-message" class="text-red-400"></div>
      </form>
      <a href="/register" class="link-main mt-4 inline-block">${t("login.register")}</a>
    </div>
  `;
}

export function attachLoginEvents() {
  let isProcessing = false;
  const forgotPassword = document.getElementById("forgot-password");
  if (forgotPassword)
  {
    forgotPassword.addEventListener("click", () => {
      forgotPasswordPopup();
    });
  }

  const form = document.getElementById("login-form") as HTMLFormElement | null;
  const msg = document.getElementById("login-message");
  const field2fa = document.getElementById("2fa-field") as HTMLDivElement | null;
  const emailNotVerfied = document.getElementById("email_not_verified");
  const emailNotVerfiedBouton = document.getElementById("email_not_verified_bouton");
  if (emailNotVerfiedBouton)
  {
    emailNotVerfiedBouton.addEventListener("click", () => {
      emailNotVerfiedPopup();
    });
  }
  if (!form) return;
  let identifierFor2FA: string | null = null;

  form.onsubmit = async (e) => {
    e.preventDefault();
    msg!.textContent = "";

    if (field2fa && field2fa.style.display !== "none") {
      const code = (form.code2fa as HTMLInputElement).value;
      const identifier = identifierFor2FA || localStorage.getItem("2fa_identifier");
      if (!identifierFor2FA || identifier === "undefined") {
        msg!.textContent = t("login.error_internal");
        return;
      }
      try {
        const res = await fetch("/api/users/auth/2fa", {
          method: "POST",
          headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, code }),
        });
        const data = await res.json();
        if (!res.ok || !data.token) {
          msg!.textContent = data.error;
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("userLogin", data.login || "");
        localStorage.setItem("userAlias", data.alias || "");
        localStorage.setItem("userAvatar", data.avatar || "");
        localStorage.removeItem("2fa_identifier");
        navigateTo("/dashboard");
      } catch (err: any) {
        msg!.textContent = err.message;
      }
      return;
    }
    if (isProcessing == true)
    {
      msg!.textContent = t("all.wait");
    }
    else
    {
      const login = (form.login as HTMLInputElement).value;
      const password = (form.password as HTMLInputElement).value;
      const stayConnected = (form.stayConnected as HTMLInputElement).checked;
      isProcessing = true;
      try {
        const res = await fetch("/api/users/auth", {
          method: "POST",
          headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: login, password, stayConnected }),
        });
        const data = await res.json();
        if (data.step === "2fa_required") {
          if (field2fa) field2fa.style.display = "";
          identifierFor2FA = data.identifier;
          localStorage.setItem("2fa_identifier", data.identifier);
          msg!.textContent = t("login.need2fa");
          return;
        }
        if (data.step === "email_not_verified")
        {
          if (emailNotVerfied) emailNotVerfied.style.display = "";
            msg!.textContent = data.error;
            return;
        }
        if (!res.ok || !data.token) {
          msg!.textContent = data.error;
          return;
        }
        localStorage.setItem("token", data.token);
        if (data.UserId)
          localStorage.setItem("userId", data.UserId.toString())
        localStorage.setItem("userLogin", data.login || "");
        localStorage.setItem("userAlias", data.alias || "");
        localStorage.setItem("userAvatar", data.avatar || "");
        localStorage.removeItem("2fa_identifier");
        navigateTo("/dashboard");
      } catch (err: any) {
        msg!.textContent = err.message;
      } finally {
        isProcessing = false;
      }
    }
  };
}

export function forgotPasswordPopup() {
  let isProcessing = false;
  const modal = document.createElement("div");
  modal.id = "confirm-modal";
  modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]";
  modal.innerHTML = `
  <div class="bg-cyan-900 rounded-2xl shadow-2xl border-2 border-cyan-400 p-8 flex flex-col items-center max-w-md w-full" role="dialog" aria-modal="true" ">
  <p class="text-cyan-200 mb-6">${t("login.forgot_password_desc")}</p>
  <input type="email" id="forgot-email" placeholder="${t("login.email")}" class="input-main mb-4 w-full" required>
  <div id="forgot-message" class="text-red-400"></div>
  <div class="flex gap-4">
  <button id="confirm-yes" class="btn-success">${t("all.yes")}</button>
  <button id="confirm-no" class="btn-danger">${t("all.no")}</button>
  </div>
  </div>
  `;
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  document.body.appendChild(modal);
  const msgForgot = document.getElementById("forgot-message");
    document.getElementById("confirm-yes")?.addEventListener("click", async () => {
      if (isProcessing == true)
      {
        msgForgot!.textContent = t("all.wait");
      }
      else
      {
        const emailInput = document.getElementById("forgot-email") as HTMLInputElement;
        isProcessing = true;
        try {
          const res = await fetch("/api/users/forgot-password", {
            method: "POST",
            headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailInput.value }),
          })
          const errorData = await res.json();
          if (!res.ok) {
            throw new Error(errorData.error);
          }
          msgForgot!.textContent = t("login.forgot_password_success");
          setTimeout(() => {
            modal.remove();
          }, 100);
        } catch (err: any) {
          msgForgot!.textContent = err.message;
        } finally {
          isProcessing = false;
        }
      }
    });
    document.getElementById("confirm-no")?.addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirm-yes")?.focus();
}

export function emailNotVerfiedPopup() {
  let isProcessing = false;
  const modal = document.createElement("div");
  modal.id = "confirm-modal";
  modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]";
  modal.innerHTML = `
  <div class="bg-cyan-900 rounded-2xl shadow-2xl border-2 border-cyan-400 p-8 flex flex-col items-center max-w-md w-full" role="dialog" aria-modal="true" ">
  <p class="text-cyan-200 mb-6">${t("login.forgot_password_desc")}</p>
  <input type="email" id="forgot-email" placeholder="${t("login.email")}" class="input-main mb-4 w-full" required>
  <div id="forgot-message" class="text-red-400"></div>
  <div class="flex gap-4">
  <button id="confirm-yes" class="btn-success">${t("all.yes")}</button>
  <button id="confirm-no" class="btn-danger">${t("all.no")}</button>
  </div>
  </div>
  `;
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  const msgForgot = document.getElementById("forgot-message");
    document.getElementById("confirm-yes")?.addEventListener("click", async () => {
      if (isProcessing == true)
      {
        msgForgot!.textContent = t("all.wait");
      }
      else
      {
        const emailInput = document.getElementById("forgot-email") as HTMLInputElement;
        isProcessing = true;
        try {
          const res = await fetch("/api/users/resend-verification", {
            method: "POST",
            headers: { "Accept-Language": localStorage.getItem("lang") || "fr", "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailInput.value }),
          })
          const errorData = await res.json();
          if (!res.ok) {
            throw new Error(errorData.error);
          }
          msgForgot!.textContent = t("login.forgot_password_success");
          setTimeout(() => {
            const emailNotVerfied = document.getElementById("email_not_verified");
            if (emailNotVerfied) emailNotVerfied.style.display = "none";
            modal.remove();
          }, 100);
        } catch (err: any) {
          msgForgot!.textContent = err.message;
        } finally {
          isProcessing = false;
        }
      }
    });
    document.getElementById("confirm-no")?.addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("confirm-yes")?.focus();
}