import {countries, ICountry, TCountryCode} from 'countries-list';
import {CountryOption} from '../types';

// Using explicit directional markers and isolation
const lri = '\u2066'; // Left-to-Right Isolate
const rli = '\u2067'; // Right-to-Left Isolate
const pdi = '\u2069'; // Pop Directional Isolate

const excludedCountries: TCountryCode[] = ['RU', 'IR', 'KP', 'CN', 'SY', 'SA', 'VE', 'CU', 'BY', 'SD', 'ZW', 'MM', 'ER', 'LY', 'IQ', 'AF', 'PK'];

export const countryList = Object.fromEntries(
  Object.entries(countries)
    .filter(([code]) => !excludedCountries.includes(code as TCountryCode))
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
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

  const separator = ' / ';
  const maxChars = 33; // TODO test on smaller displays

  const breakText = (text: string): string => {
    if (text.length <= maxChars) {
      return text;
    }
    const breakPoint = text.lastIndexOf(' ', maxChars);
    return breakPoint === -1 ? text : `${text.slice(0, breakPoint)}\n${breakText(text.slice(breakPoint + 1))}`;
  };

  if (native.length + separator.length + english.length <= maxChars) {
    return `${lri}${english}${pdi}${separator}${rli}${native}${pdi}`;
  }

  return `${lri}${english}${pdi}${separator}\n${rli}${breakText(native)}${pdi}`;
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
