import Localization from '../localization/Localization';

export const EPOCH_MILLISECONDS = 1000;
export const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
} as const;

export const toLocalDateTimeString = (date: number): string => {
  date = makeEpochMilli(date)
  return new Date(date).toLocaleString(Localization.getLocale(), {
    ...DATE_FORMAT_OPTIONS,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
}

export const toLocalDateString = (date: number): string => {
  date = makeEpochMilli(date)
  return new Date(date).toLocaleDateString(Localization.getLocale(), DATE_FORMAT_OPTIONS);
}

export const makeEpochMilli = (epoch: number): number => {
  if (!isEpochMilli(epoch)) {
    epoch = epoch * EPOCH_MILLISECONDS
  }
  return epoch
}

export const isEpochMilli = (epoch: number): boolean => {
  const epochLength = epoch.toString().length;
  return epochLength > 10;
}