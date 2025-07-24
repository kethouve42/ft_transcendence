import { navigateTo } from "../main";
import { t } from "../i18n";

export function mailConfirmView(): string {
  return `
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <div id="reset-password-message" class="text-red-400"></div>
      <a href="/" class="bg-cyan-600 hover:bg-cyan-400 text-white px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition">
        ${t("error.back_home")}
      </a>

    </div>
  `;
}

export async function mailConfirmEvents() {
    const emailConfirm = document.getElementById("emailConfirm");
    const msg = document.getElementById("emailConfirm-message");
    if (!emailConfirm) return;
    try {
        const response = await fetch("/api/reset_password", {
            method: "POST",
            headers: {
                "Accept-Language": localStorage.getItem("lang") || "fr",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: getRedirectUrl()}),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        msg!.textContent = t("emailConfirm.success_message");
        setTimeout(() => {
            navigateTo("/login");
        }, 2000);
    } catch (error) {
        msg!.textContent = error instanceof Error ? error.message : t("emailConfirm.error_message");
    }
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || "/";
}