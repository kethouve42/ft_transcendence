import { navigateTo } from "../main";
export function dashboardEditView(): string {
  return `
    <div class="w-full max-w-xl mx-auto bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 mt-8 backdrop-blur-md">
      <h2 class="text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_10px_cyan] tracking-widest uppercase mb-8">Éditer mon profil</h2>
      <form id="edit-profile-form" class="flex flex-col gap-6">
        <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">Login</label>
          <input name="login" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" required />
        </div>
        <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">Email</label>
          <input name="email" type="email" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" required />
        </div>
        <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">Alias</label>
          <input name="alias" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" />
        </div>
        <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">Avatar</label>
          <input name="avatar" class="bg-cyan-900/40 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-cyan-400/20 shadow" />
          <input type="file" id="avatar-upload" accept="image/*" class="mt-2" />
          <img id="avatar-preview" src="" alt="Aperçu avatar" class="mt-2 w-20 h-20 rounded-full border border-cyan-400" style="display:none;" />
        </div>
        <div class="mb-6">
          <label class="block font-semibold mb-1 text-cyan-200">Authentification à double facteur (2FA)</label>
          <div id="2fa-section" class="flex items-center gap-4">
            <span id="2fa-status" class="text-cyan-300">Chargement...</span>
            <button id="2fa-toggle-btn" type="button" class="bg-cyan-600 hover:bg-cyan-400 text-white px-4 py-1 rounded-lg shadow transition">
              ...
            </button>
          </div>
        </div>
        <button type="submit" class="bg-cyan-600 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-lg shadow-cyan-400/30 shadow transition">Sauvegarder</button>
        <div id="edit-profile-message" class="mt-4 text-cyan-200"></div>
      </form>
      <a href="/dashboard" class="text-cyan-400 underline mt-4 inline-block">Retour au profil</a>
    </div>
  `;
}

export function attachDashboardEditEvents() {
  window.requestAnimationFrame(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigateTo("/login");
      return;
    }
  fetch("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(user => {
      const status = document.getElementById("2fa-status");
      const btn = document.getElementById("2fa-toggle-btn") as HTMLButtonElement | null;
      if (!status || !btn) return;
      const is2FA = !!user.tfa_enabled;
      status.textContent = is2FA ? "Activé" : "Désactivé";
      btn.textContent = is2FA ? "Désactiver" : "Activer";

      btn.onclick = async () => {
        btn.disabled = true;
        status.textContent = "Traitement...";
        try {
          const res = await fetch(`/api/users/${is2FA ? "disable-2fa" : "enable-2fa"}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userRes = await fetch("/api/users/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const user = await userRes.json();
            const is2FA = !!user.tfa_enabled;
            status.textContent = is2FA ? "Activé" : "Désactivé";
            btn.textContent = is2FA ? "Désactiver" : "Activer";
          } else {
            status.textContent = "Erreur";
          }
        } catch {
          status.textContent = "Erreur";
        }
        btn.disabled = false;
      };
    });
    fetch("/api/users/profil", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(user => {
        console.log("Infos utilisateur récupérées :", user);
        const form = document.getElementById("edit-profile-form") as HTMLFormElement | null;
        if (form && user) {
          (form.elements.namedItem("login") as HTMLInputElement).value = user.login || "";
          (form.elements.namedItem("alias") as HTMLInputElement).value = user.alias || "";
          (form.elements.namedItem("email") as HTMLInputElement).value = user.email || "";
          (form.elements.namedItem("avatar") as HTMLInputElement).value = user.avatar || "";
        }
      });
    const avatarInput = document.getElementById("avatar-upload") as HTMLInputElement;
    const avatarPreview = document.getElementById("avatar-preview") as HTMLImageElement;

    if (avatarInput) {
      avatarInput.onchange = async () => {
        const file = avatarInput.files?.[0];
        if (!file) return;
        // Affiche un aperçu
        avatarPreview.src = URL.createObjectURL(file);
        avatarPreview.style.display = "block";

        // Envoie le fichier au backend
        const formData = new FormData();
        formData.append("avatar", file);

        const token = localStorage.getItem("token");
        const res = await fetch("/api/users/upload-avatar", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        } as any); // as any pour éviter TS sur headers+body

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            // Met à jour le champ avatar et le localStorage
            (document.querySelector('input[name="avatar"]') as HTMLInputElement).value = data.url;
            localStorage.setItem("userAvatar", data.url);
          }
        } else {
          const text = await res.text();
          alert("Erreur lors de l'upload de l'avatar : " + text);
        }

      };
    }
    // Gestion de la soumission du formulaire
    const form = document.getElementById("edit-profile-form") as HTMLFormElement | null;
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const login = (form.login as HTMLInputElement).value;
        const alias = (form.alias as HTMLInputElement).value;
        const email = (form.email as HTMLInputElement).value;
        const avatar = (form.avatar as HTMLInputElement).value;
        const msg = document.getElementById("edit-profile-message");

        try {
          const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ login, alias, email, avatar })
          });
          if (res.ok) {
            msg!.textContent = "Profil mis à jour !";
            msg!.className = "mt-2 text-green-500";
            localStorage.setItem("userLogin", login);
            localStorage.setItem("userAlias", alias);
            localStorage.setItem("userAvatar", avatar);
            setTimeout(() => {
              navigateTo("/dashboard");
            }, 1000);
          } else {
            const data = await res.json();
            msg!.textContent = data.error || "Erreur lors de la mise à jour";
            msg!.className = "mt-2 text-red-400";
          }
        } catch {
          msg!.textContent = "Erreur réseau";
          msg!.className = "mt-2 text-red-400";
        }
      };
    }
  });

}