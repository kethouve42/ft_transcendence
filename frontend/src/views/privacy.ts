import { tObj } from "../i18n";

export function privacyView(): string {
  const privacy = tObj("privacy");
  return `
    <div class="max-w-2xl mx-auto mt-12 bg-white/10 border border-cyan-400/20 rounded-2xl shadow-lg p-8 backdrop-blur-md text-cyan-100">
      <h1 class="text-3xl font-bold text-cyan-300 mb-6">${privacy.title}</h1>
      <p class="mb-4">${privacy.intro}</p>
      <h2 class="text-xl font-semibold text-cyan-200 mt-6 mb-2">${privacy.collected}</h2>
      <ul class="list-disc ml-6 mb-4">
        ${(privacy.collected_list as string[]).map(item => `<li>${item}</li>`).join("")}
      </ul>
      <h2 class="text-xl font-semibold text-cyan-200 mt-6 mb-2">${privacy.usage}</h2>
      <ul class="list-disc ml-6 mb-4">
        ${(privacy.usage_list as string[]).map(item => `<li>${item}</li>`).join("")}
      </ul>
      <h2 class="text-xl font-semibold text-cyan-200 mt-6 mb-2">${privacy.rights}</h2>
      <ul class="list-disc ml-6 mb-4">
        ${(privacy.rights_list as string[]).map(item => `<li>${item}</li>`).join("")}
      </ul>
      <p class="mb-4">${privacy.rights_info}</p>
      <h2 class="text-xl font-semibold text-cyan-200 mt-6 mb-2">${privacy.storage}</h2>
      <ul class="list-disc ml-6 mb-4">
        ${(privacy.storage_list as string[]).map(item => `<li>${item}</li>`).join("")}
      </ul>
      <h2 class="text-xl font-semibold text-cyan-200 mt-6 mb-2">${privacy.contact}</h2>
      <p>
        ${privacy.contact_info}
      </p>
      <a href="/" class="text-cyan-400 underline mt-8 inline-block">${privacy.back_home}</a>
    </div>
  `;
}