import Localization from '../localization/Localization'

class DateUtils {
  static EPOCH_MILLISECONDS = 1000
  // TODO fix formatting being ignored while installing the app as APK on my(bram) device (certain locale settings)
  static DATE_FORMAT_OPTIONS = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  } as const

  static toLocalDateTimeString = (date: number): string => {
    return new Date(date * DateUtils.EPOCH_MILLISECONDS).toLocaleString(Localization.getLocale(), {
      ...DateUtils.DATE_FORMAT_OPTIONS,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
  }

  static toLocalDateString = (date: number): string => {
    return new Date(date * DateUtils.EPOCH_MILLISECONDS).toLocaleDateString(
      Localization.getLocale(),
      DateUtils.DATE_FORMAT_OPTIONS
    )
  }
}

export default DateUtils
