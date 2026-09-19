import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import id from "./id.json";
import en from "./en.json";

const i18n = new I18n({ id, en });

// Default bahasa: ikut HP
i18n.locale = Localization.getLocales()[0]?.languageCode ?? "id";
i18n.enableFallback = true;
i18n.defaultLocale = "id";

// Load bahasa tersimpan dari AsyncStorage
export const loadLocale = async () => {
  try {
    const saved = await AsyncStorage.getItem("locale");
    if (saved && ["id", "en"].includes(saved)) {
      i18n.locale = saved;
    }
  } catch (e) {
    console.log("Error load locale:", e);
  }
};

// Ganti bahasa
export const setLocale = async (locale: string) => {
  if (!["id", "en"].includes(locale)) return;
  i18n.locale = locale;
  try {
    await AsyncStorage.setItem("locale", locale);
  } catch (e) {
    console.log("Error save locale:", e);
  }
};

export const t = (key: string) => i18n.t(key);

export default i18n;
