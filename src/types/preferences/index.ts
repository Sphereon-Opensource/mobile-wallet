export enum ViewPreference {
  LIST = 'LIST',
  CARD = 'CARD',
}

export enum ConfigurableViewKey {
  CREDENTIAL_OVERVIEW = 'CONFIGURABLE_VIEW_CREDENTIAL_OVERVIEW',
}

export interface IUserPreferences {
  views: Record<ConfigurableViewKey, ViewPreference>;
}
