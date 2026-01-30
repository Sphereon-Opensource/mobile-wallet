import Localization from '../localization/Localization';

export type DateFormatToken = 'DD' | 'MMM' | 'MMMM' | 'YYYY' | 'HH' | 'hh' | 'mm' | 'A' | 'TD';

const formatTokenMap: Record<DateFormatToken, string> = {
  DD: 'Day of the month (zero-padded)',
  MMM: 'Short month name',
  MMMM: 'Full month name',
  YYYY: 'Year',
  HH: '24-hour format hour (zero-padded)',
  hh: '12-hour format hour (zero-padded)',
  mm: 'Minutes (zero-padded)',
  A: 'AM/PM marker',
  TD: 'Delimiter for the time',
};

const supportedLocales = Object.values(Localization.supportedLanguages);
type SupportedLocale = (typeof supportedLocales)[number];

const timeLocaledDelimiter: Record<SupportedLocale, string> = {
  en: 'at',
  nl: 'om',
  de: 'um',
  fi: 'klo',
  sv: 'kl',
  ca: 'a les',
  es: 'a las',
  fr: 'à',
  ja: '',
  tr: 'saat',
  zh: '',
};

const getTimeLocaledDelimiter = (locale: string): string =>
  Object.values(Localization.supportedLanguages).find(lang => lang === locale) ? timeLocaledDelimiter[locale as SupportedLocale] : 'at';

export const EPOCH_MILLISECONDS = 1000;

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

export const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DATE_FORMAT_OPTIONS,
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

export const makeEpochMilli = (date: number): number => {
  if (!isEpochMilli(date)) {
    date = date * EPOCH_MILLISECONDS;
  }
  return date;
};

const isEpochMilli = (date: number): boolean => {
  return date.toString().length > 10;
};

const removeFractionalPart = (date: number): number => {
  if (date.toString().includes('.')) {
    return Number(date.toString().split('.')[0]);
  }

  return date;
};

const getMonthNames = (locale: string, type: 'long' | 'short'): string[] =>
  Array.from({length: 12}, (_, i) =>
    // any year will do
    new Intl.DateTimeFormat(locale, {month: type}).format(new Date(1925, i + 1)),
  );

export const formatDateTime = (date: Date, format: string, locale: string = Localization.getLocale()): string => {
  const monthsFull = getMonthNames(locale, 'long');
  const monthsAbbr = getMonthNames(locale, 'short');

  const day = date.getDate().toString().padStart(2, '0');
  const monthFull = monthsFull[date.getMonth()];
  const monthAbbr = monthsAbbr[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const hours12 = hours % 12;
  const hours12Str = hours12.toString().padStart(2, '0');
  const hours24Str = hours.toString().padStart(2, '0');

  const validTokens: Record<DateFormatToken, string> = {
    DD: day,
    MMM: monthAbbr,
    MMMM: monthFull,
    YYYY: year.toString(),
    HH: hours24Str,
    hh: hours12Str,
    mm: minutes,
    A: ampm,
    TD: getTimeLocaledDelimiter(locale),
  };

  const tokenRegex = new RegExp(`\\b(${Object.keys(formatTokenMap).join('|')})\\b`, 'g');

  const formattedDate = format.replace(tokenRegex, match => {
    if (match in validTokens) {
      return validTokens[match as DateFormatToken];
    } else {
      console.warn(`Unsupported format token: ${match}`);
      return match;
    }
  });

  return formattedDate;
};

export const formatDate =
  (options: Intl.DateTimeFormatOptions) =>
  (date: number): string => {
    let epoch: number = date;
    epoch = removeFractionalPart(epoch);
    if (!isEpochMilli(epoch)) {
      epoch = makeEpochMilli(epoch);
    }
    return new Date(epoch).toLocaleDateString(Localization.getLocale(), options);
  };

export const toLocalDateString = formatDate(DATE_FORMAT_OPTIONS);

export const toLocalDateTimeString = formatDate(DATE_TIME_FORMAT_OPTIONS);
