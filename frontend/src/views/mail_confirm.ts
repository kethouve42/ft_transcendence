import { navigateTo } from "../main";
import { t } from "../i18n";

export function mailConfirmView(): string {
  return `
    <div class="center-screen">
      <div id="reset-password-message" class="text-red-400"></div>
      <a href="/" class="btn-main">
        ${t("error.back_home")}
      </a>

    </div>
  `;
}

export async function mailConfirmEvents() {
    const msg = document.getElementById("reset-password-message");
    const token = getRedirectUrl();
    if (!token) {
        msg!.textContent = t("emailConfirm.error_message");
        return;
    }
    try {
        const response = await fetch(`/api/users/verify-email?token=${encodeURIComponent(token)}`, {
            method: "GET",
            headers: {
                "Accept-Language": localStorage.getItem("lang") || "fr"
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || t("emailConfirm.error_message"));
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