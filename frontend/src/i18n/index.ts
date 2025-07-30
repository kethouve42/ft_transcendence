import fr from "./fr";
import en from "./en";
import es from "./es";
import { navigateTo, updateNavbar } from "../main";

const LANGS = { fr, en, es };
const LANG_NAMES = { fr: "Français", en: "English", es: "Español" };

export type LangKey = keyof typeof LANGS;

export function getLang(): LangKey {
  return (localStorage.getItem("lang") as LangKey) || "fr";
}

export function setLang(lang: LangKey) {
  localStorage.setItem("lang", lang);
  updateNavbar();
  navigateTo(window.location.pathname + window.location.search);
}

export function t(path: string): string {
  const lang = getLang();
  const keys = path.split(".");
  let obj: any = LANGS[lang];
  for (const key of keys) obj = obj?.[key];
  return obj || path;
}

export function tObj(path: string): any {
  const lang = getLang();
  const keys = path.split(".");
  let obj: any = LANGS[lang];
  for (const key of keys) obj = obj?.[key];
  return obj;
}

export { LANGS, LANG_NAMES };