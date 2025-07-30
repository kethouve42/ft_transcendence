import { t } from "../i18n";

export function renderHome() {
  return `
    <div class="center-screen">
      <div class="max-w-4xl mx-auto px-6">
        <div class="lore-container bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-cyan-500/30">
          <h2 class="text-2xl font-bold text-cyan-200 text-center mb-6">${t("welcome")}</h2>
          
          <div class="lore-content space-y-6 text-cyan-100 leading-relaxed">
            <div class="lore-chapter">
              <p class="text-base opacity-90">${t("datalore.lore1")}</p>
            </div>
            
            <div class="lore-chapter">
              <p class="text-base opacity-90">${t("datalore.lore2")}</p>
            </div>
            
            <div class="lore-chapter">
              <p class="text-base opacity-90">${t("datalore.lore3")}</p>
            </div>
            
            <div class="lore-chapter">
              <p class="text-base opacity-90">${t("datalore.lore4")}</p>
            </div>
            
            <div class="lore-chapter">
              <p class="text-base opacity-90">${t("datalore.lore5")}</p>
            </div>
            
            <div class="lore-chapter">
              <p class="text-base opacity-90">${t("datalore.lore6")}</p>
            </div>
            
            <div class="lore-chapter">
              <p class="text-base opacity-90">${t("datalore.lore7")}</p>
            </div>
          </div>
          
          <div class="flex justify-center mt-8 space-x-4">
            <a href="/login" class="btn-primary">${t("home.start_journey")}</a>
            <a href="/register" class="btn-secondary">${t("home.join_server")}</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachHomeEvents() {
  document.querySelectorAll('.lore-chapter').forEach((chapter, index) =>
  {
    setTimeout(() => chapter.classList.add('animate-fade-in')
    , index * 500);
  });
}