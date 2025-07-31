import { navigateTo } from "../main";
import { t } from "../i18n";

export function resetPasswordView(): string {
    return `
        <div class="card-auth">
        <h2 class="title-auth">${t("reset_password.title")}</h2>
        <form id="reset-password-form" class="flex flex-col gap-6">
            <input
            type="password"
            name="password"
            placeholder="${t("reset_password.password_placeholder")}"
            required
            class="input-main"
            />
            <button
            type="submit"
            class="btn-main"
            >
            ${t("reset_password.submit")}
            </button>
        </form>
        <div id="reset-password-message" class="text-red-400"></div>
        </div>
    `;
}

export function resetPasswordEvents() {
    const form = document.getElementById("reset-password-form") as HTMLFormElement | null;
    const msg = document.getElementById("reset-password-message");
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        msg!.textContent = "";

        const password = (form.password as HTMLInputElement).value;

        try {
            const response = await fetch("/api/users/reset-password", {
                method: "POST",
                headers: {
                    "Accept-Language": localStorage.getItem("lang") || "fr",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: getRedirectUrl(), newPassword: password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            msg!.textContent = t("reset_password.success_message");
            setTimeout(() => {
                navigateTo("/login");
            }, 2000);
        } catch (error) {
            msg!.textContent = error instanceof Error ? error.message : t("reset_password.error_message");
        }
    };
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || "/";
}