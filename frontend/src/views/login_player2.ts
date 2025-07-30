import { navigateTo } from "../main";
import { t } from "../i18n";

export function loginPlayer2View(): string {
  return `
    <div class="card-auth">
      <h2 class="title-auth">Login Player 2</h2>
      <form id="login-player2-form" class="flex flex-col gap-6">
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
        <div id="2fa-field-player2" style="display:none;">
          <input
            type="text"
            name="code2fa"
            placeholder="${t("login.code2fa")}"
            maxlength="6"
            class="input-main mt-2"
          />
        </div>
        <div class="flex justify-between items-center">
          <a id="forgot-password" class="link-main mt-4 inline-block"> ${t("login.forgot_password")} </a>
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
        <div id="login-player2-message" class="text-red-400"></div>
        <a href="/registerRedirect?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}" class="link-main mt-4 inline-block">${t("login.register")}</a>
        </form>
    </div>
  `;
}

export function attachLoginPlayer2Events() {
  let isProcessing = false;
  const forgotPassword = document.getElementById("forgot-password");
  if (forgotPassword)
  {
    forgotPassword.onclick = () => {
      forgotPasswordPopup();
    }
  }
  const form = document.getElementById("login-player2-form") as HTMLFormElement | null;
  const msg = document.getElementById("login-player2-message");
  const field2fa = document.getElementById("2fa-field-player2") as HTMLDivElement | null;
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
      const identifier = identifierFor2FA || localStorage.getItem("2fa_identifier_player2");
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
          throw new Error(data.error);
        }
        localStorage.setItem("token_player2", data.token);
        localStorage.removeItem("2fa_identifier_player2");
        msg!.textContent = "Player 2 logged in!";
        setTimeout(() => {
            navigateTo(getRedirectUrl());
        }, 100);
        } catch (err: any) {
        msg!.textContent = t("login.error_2fa_connexion") + " " + err.message;
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
      const stayConnected = false;
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
          throw new Error(data.error);
        }
        localStorage.setItem("token_player2", data.token);
        if (data.UserId)
          localStorage.setItem("userId_player2", data.UserId.toString())
        localStorage.setItem("userLogin_player2", data.login || "");
        localStorage.setItem("userAlias_player2", data.alias || "");
        localStorage.setItem("userAvatar_player2", data.avatar || "");
        localStorage.removeItem("2fa_identifier");
        navigateTo(getRedirectUrl());
      } catch (err: any) {
        msg!.textContent = t("login.error_connexion") + " " + err.message;
      } finally {
        isProcessing = false;
      }
    }
  };
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "/";
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