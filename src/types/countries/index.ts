import {CountryOption} from '../component';
import {countries, ICountry, TCountryCode} from 'countries-list';

const excludedCountries: TCountryCode[] = ['RU', 'IR', 'KP', 'CN', 'SY', 'SA', 'VE', 'CU', 'BY', 'SD', 'ZW', 'MM', 'ER', 'LY', 'IQ', 'AF', 'PK'];

export const countryList = Object.fromEntries(
  Object.entries(countries)
    .filter(([code]) => !excludedCountries.includes(code as TCountryCode))
    .map(([code, country]) => [code, country]),
) as Record<TCountryCode, ICountry>;

export const countryNameLookup = Object.fromEntries(
  Object.entries(countryList).map(([code, country]) => [
    code as TCountryCode,
    {
      native: country.native,
      english: country.name,
    },
  ]),
) as Record<TCountryCode, {native: string; english: string}>;

const buildCountryLabel = (countryCode: TCountryCode) => {
  const countryLabels = countryNameLookup[countryCode];
  const {native, english} = countryLabels;

  if (native === english) {
    return native;
  }

  // Special case for RTL languages
  const isRTL = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(native);
  const separator = isRTL ? ' \u200F/\u200F ' : ' / ';

  const maxChars = 33;

  const breakText = (text: string): string => {
    if (text.length <= maxChars) return text;
    const breakPoint = text.lastIndexOf(' ', maxChars);
    return breakPoint === -1 ? text : `${text.slice(0, breakPoint)}\n${breakText(text.slice(breakPoint + 1))}`;
  };

  if (native.length + separator.length + english.length <= maxChars) {
    return isRTL ? `${english}${separator}${native}` : `${native}${separator}${english}`;
  }

  return isRTL ? `${english}${separator}\n${breakText(native)}` : `${native}${separator}\n${breakText(english)}`;
};

const getCountryFlagEmoji = (countryCode: TCountryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const createCountryOption = (countryCode: TCountryCode): CountryOption => {
  const flag = getCountryFlagEmoji(countryCode);
  return {
    countryCode,
    label: buildCountryLabel(countryCode),
    selected: false,
    flag: flag,
  };
};

export const countryOptions = Object.fromEntries(
  Object.entries(countryList).map(([code]) => [code as TCountryCode, createCountryOption(code as TCountryCode)]),
) as Record<TCountryCode, CountryOption>;
