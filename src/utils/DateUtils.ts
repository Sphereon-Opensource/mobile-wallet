import Localization from '../localization/Localization';

export const EPOCH_MILLISECONDS = 1000;
export const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
} as const;

export const toLocalDateTimeString = (date: number): string =>
  new Date(date * EPOCH_MILLISECONDS).toLocaleString(Localization.getLocale(), {
    ...DATE_FORMAT_OPTIONS,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

export const toLocalDateString = (date: number): string =>
  new Date(date * EPOCH_MILLISECONDS).toLocaleDateString(Localization.getLocale(), DATE_FORMAT_OPTIONS);
