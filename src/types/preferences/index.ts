export enum ViewPreference {
  LIST = 'LIST',
  CARD = 'CARD',
}

export enum ConfigurableViewKey {
  CREDENTIAL_OVERVIEW = 'CONFIGURABLE_VIEW_CREDENTIAL_OVERVIEW',
}

export interface IUserPreferences {
  views: Record<ConfigurableViewKey, ViewPreference>;
  language: string | null;
  warnOnExternalLink: boolean;
  warnOnLowTrust: boolean;
  confirmBrowserOpen: boolean;
  showClaimValuesByDefault: boolean;
  showRevokedCredentials: boolean;
  showExpiredCredentials: boolean;
}
