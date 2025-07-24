import i18next from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";

i18next.use(Backend).init({
  lng: "fr", // langue par défaut
  fallbackLng: "fr",
  resources: {
    fr: { translation: require("./fr/translation.json") },
    en: { translation: require("./en/translation.json") },
	es: { translation: require("./es/translation.json")}
  },
  backend: {
    loadPath: path.join(__dirname, "../locales/{{lng}}/translation.json")
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;