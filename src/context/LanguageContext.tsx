import React, { createContext, useContext, useEffect, useState } from "react";
import i18n, {
  loadLocale,
  setLocale as setLocaleStorage,
} from "../locales/i18n";

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "id",
  setLocale: async () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState(i18n.locale);

  useEffect(() => {
    loadLocale().then(() => {
      setLocaleState(i18n.locale);
    });
  }, []);

  const changeLocale = async (newLocale: string) => {
    await setLocaleStorage(newLocale);
    setLocaleState(newLocale);
  };

  const t = (key: string) => i18n.t(key);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
