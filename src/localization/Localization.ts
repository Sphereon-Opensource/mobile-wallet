import * as ExpoLocalization from 'expo-localization';
import i18n, {Scope, TranslateOptions} from 'i18n-js';
import memoize from 'lodash.memoize';

class Localization {
  public static supportedLanguages = {
    ENGLISH: 'en',
    DUTCH: 'nl',
  };

  private static translationGetters: {[locale: string]: () => object} = {
    [Localization.supportedLanguages.ENGLISH]: () => require('./translations/en.json'),
    [Localization.supportedLanguages.DUTCH]: () => require('./translations/nl.json'),
  };

  public static translate = memoize(
    (key: Scope, config?: TranslateOptions) => i18n.t(key, config),
    (key: Scope, config?: TranslateOptions) => (config ? key + JSON.stringify(config) : key),
  );

  private static findSupportedLanguage = (locale: string): string | undefined => {
    for (const language of Object.values(Localization.supportedLanguages)) {
      if (language === locale.split('-')[0]) {
        return language;
      }
    }
  };

  public static setI18nConfig = (): void => {
    // getPreferredLanguage().then(preferredLanguage => { //TODO add implementation
    const preferredLanguage = undefined;
    if (Localization.translate.cache.clear) {
      Localization.translate.cache.clear();
    }
    const fallback = Localization.supportedLanguages.ENGLISH;
    const deviceLocale = Localization.findSupportedLanguage(ExpoLocalization.locale);
    const languageTag = preferredLanguage ?? deviceLocale ?? fallback;

    i18n.translations = {
      [languageTag]: Localization.translationGetters[languageTag](),
    };
    i18n.locale = languageTag;
    // });
  };

  public static switchToLanguage = (languageTag: string = Localization.supportedLanguages.ENGLISH): void => {
    if (Localization.translate.cache.clear) {
      Localization.translate.cache.clear();
    }
    i18n.translations = {
      [languageTag]: Localization.translationGetters[languageTag](),
    };
    i18n.locale = languageTag;
  };

  public static getLocale = (): string => {
    return i18n.locale;
  };
}

export const translate = Localization.translate;
export default Localization;
