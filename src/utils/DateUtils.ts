import Localization from '../localization/Localization';

export const EPOCH_MILLISECONDS = 1000;
export const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
} as const;

export const toLocalDateTimeString = (date: number): string => {
  return new Date(formatDate(date)).toLocaleString(Localization.getLocale(), {
    ...DATE_FORMAT_OPTIONS,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
};

export const toLocalDateString = (date: number): string => {
  return new Date(formatDate(date)).toLocaleDateString(Localization.getLocale(), DATE_FORMAT_OPTIONS);
};

const formatDate = (date: number): number => {
  let epoch: number = date;
  epoch = removeFractionalPart(epoch);
  if (!isEpochMilli(epoch)) {
    epoch = makeEpochMilli(epoch);
  }

  return epoch;
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
