import { navigateTo } from "../main";
import { t } from "../i18n";

export function resetPasswordView(): string {
    return `
        <div class="max-w-md mx-auto mt-12 bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 backdrop-blur-md">
        <h2 class="text-2xl font-bold mb-6 text-cyan-300 tracking-widest uppercase">${t("reset_password.title")}</h2>
        <form id="reset-password-form" class="flex flex-col gap-6">
            <input
            type="password"
            name="password"
            placeholder="${t("reset_password.password_placeholder")}"
            required
            class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow"
            />
            <button
            type="submit"
            class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition"
            >
            ${t("reset_password.submit")}
            </button>
            <div id="reset-password-message" class="text-red-400"></div>
        </form>
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
            const response = await fetch("/api/reset_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: getRedirectUrl(), newPassword: password }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
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